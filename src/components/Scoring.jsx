import React, { useState, useEffect } from 'react';

function Scoring({ teams, matchups, transactions, currentWeek, loading }) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [activeTab, setActiveTab] = useState('live-scoring');

  useEffect(() => {
    setSelectedWeek(currentWeek);
  }, [currentWeek]);

  const calculatePositionScores = (matchup) => {
    const totalPoints = matchup.points || 0;
    return [
      { position: 'QB', points: (totalPoints * 0.25).toFixed(1) },
      { position: 'RB', points: (totalPoints * 0.3).toFixed(1) },
      { position: 'WR', points: (totalPoints * 0.25).toFixed(1) },
      { position: 'TE', points: (totalPoints * 0.1).toFixed(1) },
      { position: 'K', points: (totalPoints * 0.05).toFixed(1) },
      { position: 'DEF', points: (totalPoints * 0.05).toFixed(1) }
    ];
  };

  const calculateProjectedScore = (matchup) => {
    return ((matchup.points || 0) * 1.2).toFixed(1);
  };

  const getOpponentName = (matchup, leagueMatchups) => {
    const opponent = leagueMatchups.find(m => 
      m.matchup.matchup_id === matchup.matchup_id && 
      m.matchup.roster_id !== matchup.roster_id
    );
    return opponent ? opponent.team.team_name : 'TBD';
  };

  const renderScoringTab = () => {
    if (!matchups || matchups.length === 0) {
      return (
        <div className="no-scoring-data">
          <i className="fas fa-chart-line"></i>
          <h3>No Scoring Data</h3>
          <p>No matchup data available for the selected week.</p>
        </div>
      );
    }

    // Group matchups by league, matching both roster_id and leagueId to avoid collisions
    const matchupsByLeague = {};
    matchups.forEach(matchup => {
      const team = teams.find(t => 
        t.roster_id === matchup.roster_id && 
        (!matchup.leagueId || t.leagueId === matchup.leagueId || t.id === matchup.leagueId)
      );
      if (team) {
        const leagueKey = matchup.leagueId || team.leagueId || team.id;
        if (!matchupsByLeague[leagueKey]) {
          matchupsByLeague[leagueKey] = { name: team.league_name, entries: [] };
        }
        matchupsByLeague[leagueKey].entries.push({ matchup, team });
      }
    });

    return Object.entries(matchupsByLeague).map(([leagueKey, leagueData]) =>
      leagueData.entries.map(({ matchup, team }) => {
        const leagueMatchups = leagueData.entries;
        const positionScores = calculatePositionScores(matchup);
        
        return (
          <div key={`${leagueKey}-${matchup.roster_id}`} className="team-score-card">
            <h3>{team.team_name} ({leagueData.name})</h3>
            <div className="score-display">
              <span className="current-score">{matchup.points || 0}</span>
              <span className="projected-score">Proj: {calculateProjectedScore(matchup)}</span>
            </div>
            <div className="score-breakdown">
              <div className="position-score">
                {positionScores.map(pos => (
                  <span key={pos.position}>{pos.position}: {pos.points}</span>
                ))}
              </div>
            </div>
            <div className="matchup-info">
              <span className="week-info">Week {selectedWeek}</span>
              <span className="opponent-info">vs {getOpponentName(matchup, leagueMatchups)}</span>
            </div>
          </div>
        );
      })
    );
  };

  const renderNotificationsTab = () => {
    if (!transactions || transactions.length === 0) {
      return (
        <div className="no-notifications">
          <i className="fas fa-bell-slash"></i>
          <h3>No Recent Activity</h3>
          <p>No recent transactions or league updates to show.</p>
        </div>
      );
    }

    const recentTransactions = transactions
      .filter(t => t.status === 'complete' || t.status === 'pending')
      .slice(0, 10)
      .sort((a, b) => new Date(b.created) - new Date(a.created));

    return recentTransactions.map(transaction => {
      const notificationData = processTransactionToNotification(transaction);
      
      return (
        <div key={transaction.transaction_id} className="notification-item">
          <div className="notification-icon">
            <i className={notificationData.icon}></i>
          </div>
          <div className="notification-content">
            <h4>{notificationData.title}</h4>
            <p>{notificationData.message}</p>
            <span className="notification-time">{formatTimeAgo(transaction.created)}</span>
          </div>
          <div className="notification-actions">
            <button className="btn btn-sm btn-primary">View</button>
          </div>
        </div>
      );
    });
  };

  const processTransactionToNotification = (transaction) => {
    switch (transaction.type) {
      case 'trade':
        return {
          icon: 'fas fa-exchange-alt',
          title: 'Trade Completed',
          message: `Trade completed in ${transaction.leagueName}`
        };
      case 'waiver':
        return {
          icon: 'fas fa-user-plus',
          title: 'Waiver Claim',
          message: `Waiver claim processed in ${transaction.leagueName}`
        };
      case 'free_agent':
        return {
          icon: 'fas fa-user-plus',
          title: 'Free Agent Pickup',
          message: `Free agent pickup in ${transaction.leagueName}`
        };
      case 'drop':
        return {
          icon: 'fas fa-user-minus',
          title: 'Player Dropped',
          message: `Player dropped in ${transaction.leagueName}`
        };
      default:
        return {
          icon: 'fas fa-info-circle',
          title: 'League Update',
          message: `Activity in ${transaction.leagueName}`
        };
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <section className="section">
      <h2>Scoring & League Notifications</h2>
      
      <div className="scoring-tabs">
        <button 
          className={`tab-btn ${activeTab === 'live-scoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('live-scoring')}
        >
          Live Scoring
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          League Updates
        </button>
      </div>
      
      {activeTab === 'live-scoring' && (
        <div className="tab-content active">
          <div className="week-selector">
            <label htmlFor="week-select">Select Week:</label>
            <select 
              id="week-select"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
            >
              <option value="">Choose a week...</option>
              {Array.from({ length: 18 }, (_, i) => i + 1).map(week => (
                <option key={week} value={week}>
                  Week {week}{week === currentWeek ? ' (Current)' : ''}
                </option>
              ))}
            </select>
            <button className="btn btn-secondary btn-sm">
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
          
          <div className="scoring-grid">
            {loading ? (
              <div className="loading-indicator">
                <i className="fas fa-spinner fa-spin"></i> Loading scoring data...
              </div>
            ) : (
              renderScoringTab()
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'notifications' && (
        <div className="tab-content active">
          <div className="notifications-list">
            {loading ? (
              <div className="loading-indicator">
                <i className="fas fa-spinner fa-spin"></i> Loading notifications...
              </div>
            ) : (
              renderNotificationsTab()
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default Scoring;
