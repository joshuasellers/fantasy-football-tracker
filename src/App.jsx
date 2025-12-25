import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './styles/App.css';

// Components
import Dashboard from './components/Dashboard';
import Lineups from './components/Lineups';
import Notifications from './components/Notifications';
import Scoring from './components/Scoring';
import Updates from './components/Updates';

// Services
import { useSleeperData } from './hooks/useSleeperData';

function App() {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [isConnecting, setIsConnecting] = useState(false);
  const [username, setUsername] = useState('jselles216');
  const { 
    teams, 
    allTeams,
    matchups, 
    notifications,
    currentWeek,
    loading,
    error,
    loadUserData 
  } = useSleeperData();

  useEffect(() => {
    // Auto-load user data on app start
    loadUserData('jselles216');
  }, [loadUserData]);

  const handleFloatingConnect = async () => {
    const input = window.prompt('Enter your Sleeper username', username);
    if (input === null) return; // cancelled
    const trimmed = input.trim();
    if (!trimmed) return;

    setUsername(trimmed);
    setIsConnecting(true);
    try {
      await loadUserData(trimmed);
    } catch (e) {
      console.error('Floating connect failed:', e);
    } finally {
      setIsConnecting(false);
    }
  };

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'lineups', label: 'Starting Lineups', icon: 'fas fa-users' },
    { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
    { id: 'scoring', label: 'Scoring', icon: 'fas fa-chart-line' },
    { id: 'updates', label: 'Updates', icon: 'fas fa-info-circle' }
  ];

  return (
    <Router>
      <div className="app">
        <Header 
          sections={sections} 
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
        />
        
        <main className="main">
          <div className="container">
            <Routes>
              <Route path="/" element={
                <Dashboard 
                  teams={teams}
                  notifications={notifications}
                  loading={loading}
                />
              } />
              <Route path="/lineups" element={
                <Lineups 
                  teams={teams}
                  loading={loading}
                  onLoadUserData={loadUserData}
                />
              } />
              <Route path="/notifications" element={
                <Notifications 
                  notifications={notifications}
                  loading={loading}
                />
              } />
              <Route path="/scoring" element={
                <Scoring 
                  teams={teams}
                  allTeams={allTeams}
                  matchups={matchups}
                  currentWeek={currentWeek}
                  loading={loading}
                />
              } />
              <Route path="/updates" element={
                <Updates />
              } />
            </Routes>
          </div>
        </main>

        <button 
          className="floating-connect-button"
          onClick={handleFloatingConnect}
          disabled={isConnecting}
        >
          <i className="fas fa-plug"></i>
          {isConnecting ? 'Connecting...' : 'Connect to Sleeper'}
        </button>

        <Footer />
      </div>
    </Router>
  );
}

function Header({ sections, currentSection, onSectionChange }) {
  const location = useLocation();

  return (
    <header className="header">
      <div className="container">
        <h1>
          <i className="fas fa-football-ball"></i> 
          Fantasy Football Roster Tracker
        </h1>
        <nav className="nav">
          {sections.map(section => (
            <Link
              key={section.id}
              to={`/${section.id === 'dashboard' ? '' : section.id}`}
              className={`nav-btn ${location.pathname === '/' && section.id === 'dashboard' ? 'active' : location.pathname === `/${section.id}` ? 'active' : ''}`}
              onClick={() => onSectionChange(section.id)}
            >
              <i className={section.icon}></i>
              {section.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; 2024 Fantasy Football Roster Tracker. Built for Sleeper leagues. ESPN integration coming soon!</p>
      </div>
    </footer>
  );
}

export default App;
