import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../Dashboard';

describe('Dashboard', () => {
  const mockTeams = [
    {
      id: '1',
      league_name: 'League 1',
      team_name: 'Team 1',
      players: [
        { id: '1', name: 'Player 1', status: 'starting', projection: 10 },
        { id: '2', name: 'Player 2', status: 'bench', projection: 15 },
      ],
    },
  ];

  const mockNotifications = [
    { id: '1', read: false, title: 'Test Notification' },
    { id: '2', read: true, title: 'Read Notification' },
  ];

  it('should render dashboard with all cards', () => {
    render(<Dashboard teams={mockTeams} notifications={mockNotifications} loading={false} />);

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Teams/i)).toBeInTheDocument();
    expect(screen.getByText(/Substitution Alerts/i)).toBeInTheDocument();
    expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/Best Projection/i)).toBeInTheDocument();
  });

  it('should display correct number of active teams', () => {
    render(<Dashboard teams={mockTeams} notifications={[]} loading={false} />);

    const activeTeamsCard = screen.getByText(/Active Teams/i).closest('.dashboard-card');
    expect(activeTeamsCard).toHaveTextContent('1');
  });

  it('should calculate substitution alerts correctly', () => {
    render(<Dashboard teams={mockTeams} notifications={[]} loading={false} />);

    const alertsCard = screen.getByText(/Substitution Alerts/i).closest('.dashboard-card');
    expect(alertsCard).toHaveTextContent('1'); // Player 2 on bench has higher projection than Player 1 starting
  });

  it('should display correct number of unread notifications', () => {
    render(<Dashboard teams={mockTeams} notifications={mockNotifications} loading={false} />);

    const notificationsCard = screen.getByText(/Notifications/i).closest('.dashboard-card');
    expect(notificationsCard).toHaveTextContent('1'); // Only 1 unread notification
  });

  it('should display best projection', () => {
    render(<Dashboard teams={mockTeams} notifications={[]} loading={false} />);

    const bestProjectionCard = screen.getByText(/Best Projection/i).closest('.dashboard-card');
    expect(bestProjectionCard).toHaveTextContent('15.0'); // Highest projection is 15
  });

  it('should show fallback values when loading', () => {
    render(<Dashboard teams={[]} notifications={[]} loading={true} />);

    const cards = screen.getAllByText(/-/);
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should handle empty teams array', () => {
    render(<Dashboard teams={[]} notifications={[]} loading={false} />);

    const activeTeamsCard = screen.getByText(/Active Teams/i).closest('.dashboard-card');
    expect(activeTeamsCard).toHaveTextContent('0');
  });

  it('should handle teams with no substitution alerts', () => {
    const teamsNoAlerts = [
      {
        id: '1',
        league_name: 'League 1',
        team_name: 'Team 1',
        players: [
          { id: '1', name: 'Player 1', status: 'starting', projection: 15 },
          { id: '2', name: 'Player 2', status: 'bench', projection: 10 },
        ],
      },
    ];

    render(<Dashboard teams={teamsNoAlerts} notifications={[]} loading={false} />);

    const alertsCard = screen.getByText(/Substitution Alerts/i).closest('.dashboard-card');
    expect(alertsCard).toHaveTextContent('0');
  });
});

