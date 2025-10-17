import React, { useState } from 'react';

function Lineups({ teams, loading, onLoadUserData }) {
  const [selectedLeague, setSelectedLeague] = useState('');
  const [username, setUsername] = useState('jselles216');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!username.trim()) return;
    
    setIsConnecting(true);
    try {
      await onLoadUserData(username);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const selectedTeam = teams.find(team => team.id === selectedLeague);

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
    
    if (startingPlayers.length === 0) {
      return (
        <div className="no-lineup-data">
          <i className="fas fa-users"></i>
          <h3>No Starting Lineup</h3>
          <p>No starting players found for this team</p>
        </div>
      );
    }
    
    return startingPlayers.map(player => (
      <div key={player.id} className="lineup-card">
        <h3>{player.position} - Starting</h3>
        <div className="player-card">
          <div className="player-info">
            <span className="player-name">{player.name}</span>
            <span className="player-team">{player.team}</span>
          </div>
          <div className="player-stats">
            <span className="projection">Proj: {player.projection || '-'}</span>
            <span className="status starting">Starting</span>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <section className="section">
      <h2>Starting Lineups</h2>
      
      <div className="api-connection">
        <h3>Connect to Sleeper</h3>
        <div className="connection-form">
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your Sleeper username" 
          />
          <button 
            onClick={handleConnect}
            disabled={isConnecting}
            className="btn btn-primary"
          >
            {isConnecting ? 'Connecting...' : 'Connect to Sleeper'}
          </button>
        </div>
        <p className="connection-note">Your leagues will load automatically when the page loads</p>
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
            <p>Select a league to view your starting lineup</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Lineups;
