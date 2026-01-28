import React, { useState } from 'react';

function Lineups({ teams, loading }) {
  const [selectedLeague, setSelectedLeague] = useState('');

  const selectedTeam = teams.find(team => team.id === selectedLeague);

  const POSITION_ORDER = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'DST', 'FLEX', 'BN', 'UNK'];

  const groupPlayersByPosition = (players) => {
    const groups = {};
    players.forEach(p => {
      const pos = (p.position || 'UNK').toUpperCase();
      if (!groups[pos]) groups[pos] = [];
      groups[pos].push(p);
    });

    // Return sorted entries: known positions first, then remaining alphabetically
    const known = POSITION_ORDER.filter(pos => groups[pos]?.length);
    const rest = Object.keys(groups)
      .filter(pos => !known.includes(pos))
      .sort((a, b) => a.localeCompare(b));

    return [...known, ...rest].map(pos => ({ position: pos, players: groups[pos] }));
  };

  const renderPlayerRow = (player) => (
    <div key={player.id} className="player-card">
      <div className="player-info">
        <span className="player-name">{player.name}</span>
        <span className="player-team">{player.team}</span>
      </div>
      <div className="player-stats">
        <span className="projection">Proj: {player.projection || '-'}</span>
        <span className={`status ${player.status === 'starting' ? 'starting' : 'bench'}`}>
          {player.status === 'starting' ? 'Starting' : 'Bench'}
        </span>
      </div>
    </div>
  );

  const updateLineupDisplay = (team) => {
    if (!team || !team.players || team.players.length === 0) {
      return (
        <div className="no-lineup-data">
          <i className="fas fa-users"></i>
          <h3>No Lineup Data</h3>
          <p>No player data available for this team</p>
        </div>
      );
    }

    const startingPlayers = team.players.filter(p => p.status === 'starting');
    const benchPlayers = team.players.filter(p => p.status === 'bench');
    
    const startingByPos = groupPlayersByPosition(startingPlayers);
    const benchByPos = groupPlayersByPosition(benchPlayers);

    return (
      <div className="lineups-sections">
        <div className="lineups-section">
          <h3 className="lineups-section-title">
            <i className="fas fa-play"></i> Starting
          </h3>

          {startingPlayers.length === 0 ? (
            <div className="no-lineup-data">
              <i className="fas fa-users"></i>
              <h3>No Starting Lineup</h3>
              <p>No starting players found for this team</p>
            </div>
          ) : (
            startingByPos.map(group => (
              <div key={`starting-${group.position}`} className="position-group">
                <h4 className="position-group-title">{group.position}</h4>
                <div className="position-group-players">
                  {group.players.map(renderPlayerRow)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lineups-section">
          <h3 className="lineups-section-title">
            <i className="fas fa-chair"></i> Bench
          </h3>

          {benchPlayers.length === 0 ? (
            <div className="no-lineup-data">
              <i className="fas fa-users"></i>
              <h3>No Bench Players</h3>
              <p>No bench players found for this team</p>
            </div>
          ) : (
            benchByPos.map(group => (
              <div key={`bench-${group.position}`} className="position-group">
                <h4 className="position-group-title">{group.position}</h4>
                <div className="position-group-players">
                  {group.players.map(renderPlayerRow)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="section">
      <h2>Lineups</h2>
      
      <div className="api-connection">
        <h3>Connect to Sleeper</h3>
        <p className="connection-note">
          Use the floating “Connect to Sleeper” button (bottom right) to refresh your leagues.
          Leagues also load automatically when the app starts.
        </p>
        {loading && (
          <div className="loading-indicator">
            <i className="fas fa-spinner fa-spin"></i> Loading your leagues...
          </div>
        )}
      </div>

      <div className="league-selector">
        <label htmlFor="league-select">Select League:</label>
        <select 
          id="league-select"
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
        >
          <option value="">Choose a league...</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>
              {team.league_name} ({team.platform}) - {team.players.length} players
            </option>
          ))}
        </select>
        <p className="platform-note">Currently supporting Sleeper leagues. ESPN integration coming soon!</p>
      </div>

      <div className="lineup-container">
        {selectedTeam ? updateLineupDisplay(selectedTeam) : (
          <div className="no-lineup-data">
            <i className="fas fa-users"></i>
            <h3>No Lineup Data</h3>
            <p>Select a league to view your lineup</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Lineups;
