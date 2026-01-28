import { useState, useCallback } from 'react';
import SleeperApiService from '../services/sleeperApi';

export function useSleeperData() {
  const [teams, setTeams] = useState([]);
  const [allTeams, setAllTeams] = useState([]); // All teams in all leagues (including opponents)
  const [matchups, setMatchups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationsWeek, setNotificationsWeek] = useState(null);
  const [notificationsByWeek, setNotificationsByWeek] = useState({});
  const [notificationsLoading, setNotificationsLoading] = useState(false);
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
      const allLeagueTeams = []; // All teams including opponents
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
            SleeperApiService.getLeagueTransactions(league.league_id, nflState.week),
          ]);

          const matchupsWithLeague = currentMatchups.map(matchup => ({
            ...matchup,
            leagueId: league.league_id
          }));

          // Convert user's team to internal format
          const convertedTeam = convertSleeperDataToInternal(
            { league: leagueData, rosters, users, matchups: currentMatchups },
            players,
            user.user_id
          );

          if (convertedTeam) {
            convertedTeams.push(convertedTeam);
          }

          // Convert ALL teams in the league (including opponents)
          const leagueTeams = convertAllRostersToTeams(
            { league: leagueData, rosters, users, matchups: currentMatchups },
            players
          );
          allLeagueTeams.push(...leagueTeams);

          allMatchups.push(...matchupsWithLeague);

          // Add transactions with league context
          allTransactions.push(...leagueTransactions.map(t => ({ 
            ...t, 
            leagueId: league.league_id,
            leagueName: leagueData.name 
          })));

        } catch (leagueError) {
          console.error(`Error processing league ${league.league_id}:`, leagueError);
        }
      }

      // Process notifications from transactions
      const processedNotifications = processTransactionsToNotifications(allTransactions);

      // Update state
      setTeams(convertedTeams);
      setAllTeams(allLeagueTeams);
      setMatchups(allMatchups);
      setNotifications(processedNotifications);
      setNotificationsWeek(nflState.week);
      setNotificationsByWeek(prev => ({ ...prev, [nflState.week]: processedNotifications }));
      setAllWeeksData(prev => ({ ...prev, [nflState.week]: allMatchups }));

    } catch (err) {
      setError(err.message);
      console.error('Error loading Sleeper data:', err);
    } finally {
      setLoading(false);
    }
  }, [playersData]);

  const loadNotificationsWeek = useCallback(async (week) => {
    if (!week) return;
    if (notificationsByWeek[week]) {
      setNotifications(notificationsByWeek[week]);
      setNotificationsWeek(week);
      return;
    }

    setNotificationsLoading(true);
    try {
      const leagueIds = Array.from(new Set(teams.map(t => t.leagueId || t.id)));
      const allTransactions = [];

      await Promise.all(
        leagueIds.map(async (leagueId) => {
          const leagueTransactions = await SleeperApiService.getLeagueTransactions(leagueId, week);
          allTransactions.push(
            ...leagueTransactions.map(t => ({
              ...t,
              leagueId,
              leagueName: teams.find(x => (x.leagueId || x.id) === leagueId)?.league_name
            }))
          );
        })
      );

      const processed = processTransactionsToNotifications(allTransactions);
      setNotifications(processed);
      setNotificationsWeek(week);
      setNotificationsByWeek(prev => ({ ...prev, [week]: processed }));
    } catch (e) {
      console.error('Error loading notifications for week:', e);
    } finally {
      setNotificationsLoading(false);
    }
  }, [notificationsByWeek, teams]);

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

      // Fetch new week data for all unique leagues
      const uniqueLeagues = new Set();
      teams.forEach(team => uniqueLeagues.add(team.leagueId || team.id));
      allTeams.forEach(team => uniqueLeagues.add(team.leagueId));

      const weekMatchups = [];
      for (const leagueId of uniqueLeagues) {
        try {
          const matchups = await SleeperApiService.getLeagueMatchups(leagueId, week);
          const matchupsWithLeague = matchups.map(matchup => ({
            ...matchup,
            leagueId: leagueId
          }));
          weekMatchups.push(...matchupsWithLeague);
        } catch (error) {
          console.error(`Error fetching week ${week} data for league ${leagueId}:`, error);
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
  }, [currentWeek, allWeeksData, teams, allTeams]);

  return {
    teams,
    allTeams, // All teams in all leagues (including opponents)
    matchups,
    notifications,
    notificationsWeek,
    notificationsLoading,
    currentWeek,
    loading,
    error,
    allWeeksData,
    loadUserData,
    loadNotificationsWeek,
    loadWeekData
  };
}

// Helper function to convert Sleeper data to internal format (user's teams only)
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
    leagueId: league.league_id,
    league_name: league.name,
    team_name: userInfo.metadata.team_name,
    platform: 'Sleeper',
    players: convertedPlayers,
    currentScore: currentMatchup ? currentMatchup.points : 0,
    projectedScore: 0, // Would need additional API call for projections
    roster_id: userRoster.roster_id,
    settings: userRoster.settings
  };
}

// Helper function to convert ALL rosters to team objects (including opponents)
function convertAllRostersToTeams(sleeperData, playersData) {
  const { league, rosters, users, matchups } = sleeperData;
  const convertedTeams = [];

  // Process each roster in the league
  for (const roster of rosters) {
    // Find user info for this roster
    const userInfo = users.find(user => user.user_id === roster.owner_id);
    if (!userInfo) continue;

    // Get matchup data for this roster
    const matchup = matchups.find(m => m.roster_id === roster.roster_id);
    
    // Convert roster players to our format with scores
    const convertedPlayers = roster.players.map(playerId => {
      const player = playersData[playerId];
      const isStarting = roster.starters.includes(playerId);
      
      // Get player score from matchup data if available
      let playerScore = 0;
      if (matchup && matchup.players_points) {
        playerScore = matchup.players_points[playerId] || 0;
      }

      if (!player) {
        return {
          id: playerId,
          name: `Player ${playerId}`,
          team: 'UNK',
          position: 'UNK',
          projection: 0,
          score: playerScore,
          status: isStarting ? 'starting' : 'bench',
          injury_status: null,
          news_updated: null
        };
      }
      
      return {
        id: playerId,
        name: `${player.first_name} ${player.last_name}`,
        team: player.team || 'UNK',
        position: player.position || 'UNK',
        projection: 0,
        score: playerScore,
        status: isStarting ? 'starting' : 'bench',
        injury_status: player.injury_status,
        news_updated: player.news_updated
      };
    });

    // Create team object
    const teamObject = {
      id: `${league.league_id}-${roster.roster_id}`, // Unique ID combining league and roster
      leagueId: league.league_id,
      league_name: league.name,
      team_name: userInfo.metadata?.team_name || userInfo.display_name || `Team ${roster.roster_id}`,
      owner_id: roster.owner_id,
      owner_display_name: userInfo.display_name,
      platform: 'Sleeper',
      players: convertedPlayers,
      currentScore: matchup ? matchup.points : 0,
      projectedScore: 0,
      roster_id: roster.roster_id,
      settings: roster.settings,
      matchup_id: matchup ? matchup.matchup_id : null
    };

    convertedTeams.push(teamObject);
  }

  return convertedTeams;
}

// Helper function to process transactions into notifications
function processTransactionsToNotifications(transactions) {
  return transactions
    .filter(t => t.status === 'complete' || t.status === 'pending')
    .slice(0, 50) // Show last 50 transactions
    .sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0))
    .map(transaction => ({
      id: transaction.transaction_id || transaction.leg || `txn-${Date.now()}-${Math.random()}`,
      type: transaction.type,
      title: getTransactionTitle(transaction.type),
      message: getTransactionMessage(transaction),
      time: formatTimeAgo(transaction.created),
      leagueName: transaction.leagueName,
      leagueId: transaction.leagueId,
      read: false,
      status: transaction.status,
      created: transaction.created
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

function getTransactionMessage(transaction) {
  const leagueName = transaction.leagueName || 'League';
  switch (transaction.type) {
    case 'trade':
      return `Trade completed in ${leagueName}`;
    case 'waiver':
      return `Waiver claim processed in ${leagueName}`;
    case 'free_agent':
      return `Free agent pickup in ${leagueName}`;
    case 'drop':
      return `Player dropped in ${leagueName}`;
    default:
      return `Activity in ${leagueName}`;
  }
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Unknown time';
  
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}
