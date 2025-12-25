import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { useSleeperData } from '../hooks/useSleeperData';

// Mock the useSleeperData hook
jest.mock('../hooks/useSleeperData');

describe('App', () => {
  const mockUseSleeperData = {
    teams: [],
    allTeams: [],
    matchups: [],
    notifications: [],
    currentWeek: 1,
    loading: false,
    error: null,
    loadUserData: jest.fn(),
  };

  beforeEach(() => {
    useSleeperData.mockReturnValue(mockUseSleeperData);
  });

  it('should render the app with header and navigation', () => {
    render(<App />);

    expect(screen.getAllByText(/Fantasy Football Roster Tracker/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Starting Lineups/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Notifications/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Scoring/i).length).toBeGreaterThan(0);
  });

  it('should render footer', () => {
    render(<App />);

    expect(screen.getByText(/2024 Fantasy Football Roster Tracker/i)).toBeInTheDocument();
  });

  it('should call loadUserData on mount', () => {
    render(<App />);

    expect(mockUseSleeperData.loadUserData).toHaveBeenCalledWith('jselles216');
  });

  it('should render Dashboard component on root path', () => {
    render(<App />);

    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
  });
});

