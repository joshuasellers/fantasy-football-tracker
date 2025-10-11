import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './styles/App.css';

// Components
import Dashboard from './components/Dashboard';
import Lineups from './components/Lineups';
import Recommendations from './components/Recommendations';
import Scoring from './components/Scoring';

// Services
import { useSleeperData } from './hooks/useSleeperData';

function App() {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const { 
    teams, 
    matchups, 
    transactions, 
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

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'lineups', label: 'Starting Lineups', icon: 'fas fa-users' },
    { id: 'recommendations', label: 'Bench Recommendations', icon: 'fas fa-lightbulb' },
    { id: 'scoring', label: 'Scoring & Notifications', icon: 'fas fa-chart-line' }
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
              <Route path="/recommendations" element={
                <Recommendations 
                  teams={teams}
                  loading={loading}
                />
              } />
              <Route path="/scoring" element={
                <Scoring 
                  teams={teams}
                  matchups={matchups}
                  transactions={transactions}
                  currentWeek={currentWeek}
                  loading={loading}
                />
              } />
            </Routes>
          </div>
        </main>

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
