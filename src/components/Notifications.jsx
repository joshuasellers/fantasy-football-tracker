import React, { useEffect, useState, useMemo } from 'react';

function Notifications({ notifications, loading, currentWeek, notificationsWeek, notificationsLoading, onLoadWeek }) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek || 1);
  const [selectedLeague, setSelectedLeague] = useState('all');

  useEffect(() => {
    if (currentWeek && selectedWeek !== currentWeek && notificationsWeek == null) {
      setSelectedWeek(currentWeek);
    }
  }, [currentWeek, notificationsWeek, selectedWeek]);

  useEffect(() => {
    if (!onLoadWeek) return;
    if (!selectedWeek) return;
    // Load when week changes, or if we don't yet have data for the selected week
    if (notificationsWeek !== selectedWeek) {
      onLoadWeek(selectedWeek);
    }
  }, [onLoadWeek, selectedWeek, notificationsWeek]);

  const isLoading = loading || notificationsLoading;

  // Get unique leagues from notifications
  const availableLeagues = useMemo(() => {
    if (!notifications || notifications.length === 0) return [];
    const leaguesMap = new Map();
    notifications.forEach(notif => {
      if (notif.leagueId && notif.leagueName) {
        leaguesMap.set(notif.leagueId, notif.leagueName);
      }
    });
    return Array.from(leaguesMap.entries()).map(([id, name]) => ({ id, name }));
  }, [notifications]);

  // Filter notifications by selected league
  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    if (selectedLeague === 'all') return notifications;
    return notifications.filter(notif => notif.leagueId === selectedLeague);
  }, [notifications, selectedLeague]);

  // Reset league filter when notifications change (new week loaded)
  useEffect(() => {
    if (selectedLeague !== 'all' && !availableLeagues.find(l => l.id === selectedLeague)) {
      setSelectedLeague('all');
    }
  }, [availableLeagues, selectedLeague]);

  if (isLoading) {
    return (
      <section className="section">
        <h2>League Notifications</h2>
        <p className="section-description">Recent transactions and league updates</p>
        <div className="notifications-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div className="week-selector">
            <label htmlFor="notifications-week-select">Select Week:</label>
            <select
              id="notifications-week-select"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
            >
              {Array.from({ length: 18 }, (_, i) => i + 1).map(week => (
                <option key={week} value={week}>
                  Week {week}{week === currentWeek ? ' (Current)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="loading-indicator">
          <i className="fas fa-spinner fa-spin"></i> Loading notifications...
        </div>
      </section>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <section className="section">
        <h2>League Notifications</h2>
        <p className="section-description">Recent transactions and league updates</p>
        <div className="notifications-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div className="week-selector">
            <label htmlFor="notifications-week-select">Select Week:</label>
            <select
              id="notifications-week-select"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
            >
              {Array.from({ length: 18 }, (_, i) => i + 1).map(week => (
                <option key={week} value={week}>
                  Week {week}{week === currentWeek ? ' (Current)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="no-notifications">
          <i className="fas fa-bell-slash"></i>
          <h3>No Recent Activity</h3>
          <p>No recent transactions or league updates to show.</p>
        </div>
      </section>
    );
  }

  const renderFilters = () => (
    <div className="notifications-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
      <div className="week-selector">
        <label htmlFor="notifications-week-select">Select Week:</label>
        <select
          id="notifications-week-select"
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
        >
          {Array.from({ length: 18 }, (_, i) => i + 1).map(week => (
            <option key={week} value={week}>
              Week {week}{week === currentWeek ? ' (Current)' : ''}
            </option>
          ))}
        </select>
      </div>
      {availableLeagues.length > 0 && (
        <div className="league-selector">
          <label htmlFor="notifications-league-select">Filter by League:</label>
          <select
            id="notifications-league-select"
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
          >
            <option value="all">All Leagues</option>
            {availableLeagues.map(league => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  return (
    <section className="section">
      <h2>League Notifications</h2>
      <p className="section-description">Recent transactions and league updates</p>
      {renderFilters()}
      
      {filteredNotifications.length === 0 ? (
        <div className="no-notifications">
          <i className="fas fa-bell-slash"></i>
          <h3>No Notifications Found</h3>
          <p>No notifications match the selected filters.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map(notification => {
          const iconMap = {
            'trade': 'fas fa-exchange-alt',
            'waiver': 'fas fa-user-plus',
            'free_agent': 'fas fa-user-plus',
            'drop': 'fas fa-user-minus',
          };

          return (
            <div key={notification.id} className="notification-item">
              <div className="notification-icon">
                <i className={iconMap[notification.type] || 'fas fa-info-circle'}></i>
              </div>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                {notification.leagueName && (
                  <span className="notification-league" style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginTop: '0.25rem' }}>
                    {notification.leagueName}
                  </span>
                )}
                <span className="notification-time">{notification.time}</span>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </section>
  );
}

export default Notifications;
