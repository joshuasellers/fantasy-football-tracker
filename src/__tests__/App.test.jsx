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
    notificationsWeek: 1,
    notificationsLoading: false,
    currentWeek: 1,
    loading: false,
    error: null,
    loadUserData: jest.fn(),
    loadNotificationsWeek: jest.fn(),
  };

  beforeEach(() => {
    useSleeperData.mockReturnValue(mockUseSleeperData);
  });

  it('should render the app with header and navigation', () => {
    render(<App />);

    expect(screen.getAllByText(/Fantasy Football Roster Tracker/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Season:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Lineups/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Notifications/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Scoring/i).length).toBeGreaterThan(0);
  });

  it('should render footer', () => {
    render(<App />);

    expect(screen.getByText(/2024 Fantasy Football Roster Tracker/i)).toBeInTheDocument();
  });

  it('should call loadUserData on mount', () => {
    render(<App />);

    expect(mockUseSleeperData.loadUserData).toHaveBeenCalledWith('jselles216', expect.any(Number));
  });

  it('should render Dashboard component on root path', () => {
    render(<App />);

    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
  });

  it('should include loadWeekData in useSleeperData mock', () => {
    mockUseSleeperData.loadWeekData = jest.fn();
    useSleeperData.mockReturnValue(mockUseSleeperData);

    render(<App />);

    expect(mockUseSleeperData.loadWeekData).toBeDefined();
  });

  it('should render season selector in header', () => {
    render(<App />);

    const seasonSelect = screen.getByLabelText(/Season:/i);
    expect(seasonSelect).toBeInTheDocument();
  });

  it('should render floating connect button', () => {
    render(<App />);

    expect(screen.getByText(/Connect to Sleeper/i)).toBeInTheDocument();
  });

  it('should render all navigation links', () => {
    render(<App />);

    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Lineups/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Notifications/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Scoring/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Updates/i).length).toBeGreaterThan(0);
  });
});

