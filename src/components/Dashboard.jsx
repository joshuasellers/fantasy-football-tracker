import React from 'react';

function Dashboard({ teams, notifications, loading }) {
  const calculatePotentialSubstitutions = () => {
    let alerts = 0;
    teams.forEach(team => {
      const startingPlayers = team.players.filter(p => p.status === 'starting');
      const benchPlayers = team.players.filter(p => p.status === 'bench');
      
      startingPlayers.forEach(starter => {
        const betterBenchOption = benchPlayers.find(bench => bench.projection > starter.projection);
        if (betterBenchOption) {
          alerts++;
        }
      });
    });
    return alerts;
  };

  const findBestProjection = () => {
    let best = 0;
    teams.forEach(team => {
      team.players.forEach(player => {
        if (player.projection > best) {
          best = player.projection;
        }
      });
    });
    return best.toFixed(1);
  };

  const getDisplayValue = (value, fallback = '-') => {
    if (loading) return fallback;
    return value >= 0 ? value : fallback;
  };

  const dashboardCards = [
    {
      id: 'active-teams',
      title: 'Active Teams',
      icon: 'fas fa-users',
      value: getDisplayValue(teams.length),
      description: 'Teams across all leagues'
    },
    {
      id: 'substitution-alerts',
      title: 'Substitution Alerts',
      icon: 'fas fa-exclamation-triangle',
      value: getDisplayValue(calculatePotentialSubstitutions()),
      description: 'Players to consider benching'
    },
    {
      id: 'notifications-count',
      title: 'Notifications',
      icon: 'fas fa-bell',
      value: getDisplayValue(notifications.filter(n => !n.read).length),
      description: 'Unread league updates'
    },
    {
      id: 'best-projection',
      title: 'Best Projection',
      icon: 'fas fa-trophy',
      value: getDisplayValue(findBestProjection()),
      description: 'Points from top player'
    }
  ];

  return (
    <section className="section active">
      <h2>Dashboard</h2>
      <div className="dashboard-grid">
        {dashboardCards.map(card => (
          <div key={card.id} className="dashboard-card">
            <h3>
              <i className={card.icon}></i> 
              {card.title}
            </h3>
            <div className="stat-number">{card.value}</div>
            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Dashboard;
