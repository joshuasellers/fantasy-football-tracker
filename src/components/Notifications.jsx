import React, { useState } from 'react';

function Notifications({ teams, loading }) {
  const [dismissedRecommendations, setDismissedRecommendations] = useState(new Set());

  const generateRecommendations = () => {
    const recommendations = [];
    
    teams.forEach(team => {
      const startingPlayers = team.players.filter(p => p.status === 'starting');
      const benchPlayers = team.players.filter(p => p.status === 'bench');
      
      startingPlayers.forEach(starter => {
        const betterBenchOption = benchPlayers.find(bench => bench.projection > starter.projection);
        if (betterBenchOption) {
          recommendations.push({
            id: `${team.id}-${starter.name}`,
            teamId: team.id,
            teamName: team.team_name,
            platform: team.platform,
            starter: starter,
            benchOption: betterBenchOption,
            priority: calculatePriority(starter.projection, betterBenchOption.projection)
          });
        }
      });
    });
    
    return recommendations
      .filter(rec => !dismissedRecommendations.has(rec.id))
      .sort((a, b) => b.priority.value - a.priority.value);
  };

  const calculatePriority = (starterProjection, benchProjection) => {
    const difference = benchProjection - starterProjection;
    if (difference >= 5) return { level: 'High', value: 3 };
    if (difference >= 2) return { level: 'Medium', value: 2 };
    return { level: 'Low', value: 1 };
  };

  const handlePlayerSwap = (recommendation) => {
    // In a real app, this would make an API call to Sleeper
    console.log('Player swap:', recommendation);
    // For now, just dismiss the recommendation
    setDismissedRecommendations(prev => new Set([...prev, recommendation.id]));
  };

  const dismissRecommendation = (recommendationId) => {
    setDismissedRecommendations(prev => new Set([...prev, recommendationId]));
  };

  const recommendations = generateRecommendations();

  if (loading) {
    return (
      <section className="section">
        <h2>Bench Recommendations</h2>
        <p className="section-description">Players you should consider benching for better options</p>
        <div className="loading-indicator">
          <i className="fas fa-spinner fa-spin"></i> Loading recommendations...
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <h2>Bench Recommendations</h2>
      <p className="section-description">Players you should consider benching for better options</p>
      
      <div className="recommendations-container">
        {recommendations.length === 0 ? (
          <div className="no-recommendations">
            <i className="fas fa-check-circle"></i>
            <h3>No Recommendations</h3>
            <p>Your lineups look optimal! All your starting players have better projections than your bench options.</p>
          </div>
        ) : (
          recommendations.map(rec => (
            <div key={rec.id} className="recommendation-card">
              <div className="recommendation-header">
                <h3>
                  <i className="fas fa-arrow-down"></i> Consider Benching
                </h3>
                <span className="alert-badge">{rec.priority.level} Priority</span>
              </div>
              
              <div className="recommendation-context">
                <span className="league-info">
                  <i className="fas fa-trophy"></i> {rec.teamName}
                </span>
                <span className="team-info">
                  <i className="fas fa-users"></i> {rec.platform}
                </span>
              </div>
              
              <div className="player-comparison">
                <div className="current-starter">
                  <h4>Currently Starting</h4>
                  <div className="player-card">
                    <div className="player-info">
                      <span className="player-name">{rec.starter.name}</span>
                      <span className="player-team">{rec.starter.team}</span>
                    </div>
                    <div className="player-stats">
                      <span className="projection">Proj: {rec.starter.projection}</span>
                      <span className="status starting">Starting</span>
                    </div>
                  </div>
                </div>
                
                <div className="vs-divider">
                  <i className="fas fa-arrow-right"></i>
                </div>
                
                <div className="bench-option">
                  <h4>Better Option on Bench</h4>
                  <div className="player-card">
                    <div className="player-info">
                      <span className="player-name">{rec.benchOption.name}</span>
                      <span className="player-team">{rec.benchOption.team}</span>
                    </div>
                    <div className="player-stats">
                      <span className="projection">Proj: {rec.benchOption.projection}</span>
                      <span className="status bench">On Bench</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="recommendation-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handlePlayerSwap(rec)}
                >
                  Make Swap
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => dismissRecommendation(rec.id)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Notifications;
