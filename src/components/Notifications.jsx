import React from 'react';

function Notifications({ notifications, loading }) {
  if (loading) {
    return (
      <section className="section">
        <h2>League Notifications</h2>
        <p className="section-description">Recent transactions and league updates</p>
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
