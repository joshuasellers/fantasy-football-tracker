import { useState, useCallback } from 'react';
import SleeperApiService from '../services/sleeperApi';

export function useSleeperData() {
  const [teams, setTeams] = useState([]);
  const [matchups, setMatchups] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allWeeksData, setAllWeeksData] = useState({});
  const [playersData, setPlayersData] = useState({});

  const loadUserData = useCallback(async (username) => {
    if (!username) return;

    setLoading(true);
    setError(null);

    try {
      // Get user and leagues
      const user = await SleeperApiService.getUser(username);
      const leagues = await SleeperApiService.getUserLeagues(user.user_id);
      
      // Get NFL state for current week
      const nflState = await SleeperApiService.getNflState();
      setCurrentWeek(nflState.week);

      // Get players data (cached)
      let players = playersData;
      if (Object.keys(players).length === 0) {
        players = await SleeperApiService.getAllPlayers();
        setPlayersData(players);
      }

      // Process each league
      const convertedTeams = [];
      const allMatchups = [];
      const allTransactions = [];

      for (const league of leagues) {
        try {
          // Get league data
          const [leagueData, rosters, users, currentMatchups, leagueTransactions] = await Promise.all([
            SleeperApiService.getLeague(league.league_id),
            SleeperApiService.getLeagueRosters(league.league_id),
            SleeperApiService.getLeagueUsers(league.league_id),
            SleeperApiService.getLeagueMatchups(league.league_id, nflState.week),
            SleeperApiService.getLeagueTransactions(league.league_id)
          ]);

          // Convert to internal format
          const convertedTeam = convertSleeperDataToInternal(
            { league: leagueData, rosters, users, matchups: currentMatchups },
            players,
            user.user_id
          );

          if (convertedTeam) {
            convertedTeams.push(convertedTeam);
            allMatchups.push(...currentMatchups);
          }

          // Add transactions with league context
          allTransactions.push(...leagueTransactions.map(t => ({ 
            ...t, 
            leagueName: leagueData.name 
          })));

        } catch (leagueError) {
          console.error(`Error processing league ${league.league_id}:`, leagueError);
        }
      }

      // Update state
      setTeams(convertedTeams);
      setMatchups(allMatchups);
      setTransactions(allTransactions);
      setAllWeeksData(prev => ({ ...prev, [nflState.week]: allMatchups }));

      // Process notifications from transactions
      const processedNotifications = processTransactionsToNotifications(allTransactions);
      setNotifications(processedNotifications);

    } catch (err) {
      setError(err.message);
      console.error('Error loading Sleeper data:', err);
    } finally {
      setLoading(false);
    }
  }, [playersData]);

  const loadWeekData = useCallback(async (week) => {
    if (!week || week === currentWeek) return;

    setLoading(true);

    try {
      // Check if we already have this week's data
      if (allWeeksData[week]) {
        setMatchups(allWeeksData[week]);
        setLoading(false);
        return;
      }

      // Fetch new week data
      const weekMatchups = [];
      for (const team of teams) {
        try {
          const matchups = await SleeperApiService.getLeagueMatchups(team.id, week);
          weekMatchups.push(...matchups);
        } catch (error) {
          console.error(`Error fetching week ${week} data for league ${team.id}:`, error);
        }
      }

      // Store the data
      setAllWeeksData(prev => ({ ...prev, [week]: weekMatchups }));
      setMatchups(weekMatchups);

    } catch (error) {
      console.error('Error loading week data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentWeek, allWeeksData, teams]);

  return {
    teams,
    matchups,
    transactions,
    notifications,
    currentWeek,
    loading,
    error,
    allWeeksData,
    loadUserData,
    loadWeekData
  };
}

// Helper function to convert Sleeper data to internal format
function convertSleeperDataToInternal(sleeperData, playersData, userId) {
  const { league, rosters, users, matchups } = sleeperData;
  
  // Find user's roster
  const userRoster = rosters.find(roster => roster.owner_id === userId);
  if (!userRoster) return null;

  // Get user info
  const userInfo = users.find(user => user.user_id === userRoster.owner_id);
  
  // Convert roster players to our format
  const convertedPlayers = userRoster.players.map(playerId => {
    const player = playersData[playerId];
    if (!player) {
      // Handle case where player data is missing
      return {
        id: playerId,
        name: `Player ${playerId}`,
        team: 'UNK',
        position: 'UNK',
        projection: 0,
        status: userRoster.starters.includes(playerId) ? 'starting' : 'bench',
        injury_status: null,
        news_updated: null
      };
    }
    
    // Check if player is starting
    const isStarting = userRoster.starters.includes(playerId);
    
    return {
      id: playerId,
      name: `${player.first_name} ${player.last_name}`,
      team: player.team || 'UNK',
      position: player.position || 'UNK',
      projection: 0, // Sleeper doesn't provide projections in this endpoint
      status: isStarting ? 'starting' : 'bench',
      injury_status: player.injury_status,
      news_updated: player.news_updated
    };
  });

  // Get current matchup data
  const currentMatchup = matchups.find(matchup => matchup.roster_id === userRoster.roster_id);
  
  return {
    id: league.league_id,
    name: league.name,
    platform: 'Sleeper',
    players: convertedPlayers,
    currentScore: currentMatchup ? currentMatchup.points : 0,
    projectedScore: 0, // Would need additional API call for projections
    roster_id: userRoster.roster_id,
    settings: userRoster.settings
  };
}

// Helper function to process transactions into notifications
function processTransactionsToNotifications(transactions) {
  return transactions
    .filter(t => t.status === 'complete' || t.status === 'pending')
    .slice(0, 10) // Show last 10 transactions
    .sort((a, b) => new Date(b.created) - new Date(a.created))
    .map(transaction => ({
      id: transaction.transaction_id,
      type: transaction.type,
      title: getTransactionTitle(transaction.type),
      message: `${getTransactionTitle(transaction.type)} in ${transaction.leagueName}`,
      time: formatTimeAgo(transaction.created),
      read: false
    }));
}

function getTransactionTitle(type) {
  switch (type) {
    case 'trade': return 'Trade Completed';
    case 'waiver': return 'Waiver Claim';
    case 'free_agent': return 'Free Agent Pickup';
    case 'drop': return 'Player Dropped';
    default: return 'League Update';
  }
}

function formatTimeAgo(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}
