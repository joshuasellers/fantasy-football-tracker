import React, { useEffect, useState } from 'react';

function Notifications({ notifications, loading, currentWeek, notificationsWeek, notificationsLoading, onLoadWeek }) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek || 1);

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

  if (isLoading) {
    return (
      <section className="section">
        <h2>League Notifications</h2>
        <p className="section-description">Recent transactions and league updates</p>
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
        <div className="no-notifications">
          <i className="fas fa-bell-slash"></i>
          <h3>No Recent Activity</h3>
          <p>No recent transactions or league updates to show.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <h2>League Notifications</h2>
      <p className="section-description">Recent transactions and league updates</p>
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
      
      <div className="notifications-list">
        {notifications.map(notification => {
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
                <span className="notification-time">{notification.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Notifications;
