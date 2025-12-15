import React, { useState, useEffect } from 'react';

function Scoring({ teams, allTeams, matchups, currentWeek, loading }) {
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

  const getOpponentName = (matchup) => {
    const opponentMatchup = matchups.find(m => 
      m.matchup_id === matchup.matchup_id && 
      m.roster_id !== matchup.roster_id && 
      m.leagueId === matchup.leagueId
    );
    
    if (!opponentMatchup) return 'TBD';
    
    const opponent = allTeams.find(t => 
      t.roster_id === opponentMatchup.roster_id && 
      t.leagueId === matchup.leagueId
    );
    return opponent ? opponent.team_name : 'TBD';
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
              <span className="opponent-info">vs {getOpponentName(matchup)}</span>
            </div>
          </div>
        );
      })
    );
  };

  const renderNotificationsTab = () => {
    return (
      <div className="no-notifications">
        <i className="fas fa-bell-slash"></i>
        <h3>No Recent Activity</h3>
        <p>Notifications are currently unavailable. This feature may be added in a future update.</p>
      </div>
    );
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
