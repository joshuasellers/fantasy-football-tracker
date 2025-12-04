import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Recommendations from '../Recommendations';

describe('Recommendations', () => {
  const mockTeams = [
    {
      id: '1',
      league_name: 'League 1',
      team_name: 'Team 1',
      platform: 'Sleeper',
      players: [
        { id: '1', name: 'Player 1', team: 'NYG', position: 'RB', status: 'starting', projection: 10 },
        { id: '2', name: 'Player 2', team: 'DAL', position: 'WR', status: 'bench', projection: 15 },
      ],
    },
  ];

  it('should render recommendations component', () => {
    render(<Recommendations teams={mockTeams} loading={false} />);

    expect(screen.getByText(/Bench Recommendations/i)).toBeInTheDocument();
    expect(screen.getByText(/Players you should consider benching/i)).toBeInTheDocument();
  });

  it('should show no recommendations when lineups are optimal', () => {
    const optimalTeams = [
      {
        id: '1',
        league_name: 'League 1',
        team_name: 'Team 1',
        platform: 'Sleeper',
        players: [
          { id: '1', name: 'Player 1', team: 'NYG', position: 'RB', status: 'starting', projection: 15 },
          { id: '2', name: 'Player 2', team: 'DAL', position: 'WR', status: 'bench', projection: 10 },
        ],
      },
    ];

    render(<Recommendations teams={optimalTeams} loading={false} />);

    expect(screen.getByText(/No Recommendations/i)).toBeInTheDocument();
    expect(screen.getByText(/Your lineups look optimal!/i)).toBeInTheDocument();
  });

  it('should display recommendations when bench players have higher projections', () => {
    render(<Recommendations teams={mockTeams} loading={false} />);

    expect(screen.getAllByText(/Consider Benching/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Player 1/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Player 2/i).length).toBeGreaterThan(0);
  });

  it('should show priority badge for recommendations', () => {
    const highPriorityTeam = [
      {
        id: '1',
        league_name: 'League 1',
        team_name: 'Team 1',
        platform: 'Sleeper',
        players: [
          { id: '1', name: 'Player 1', team: 'NYG', position: 'RB', status: 'starting', projection: 5 },
          { id: '2', name: 'Player 2', team: 'DAL', position: 'WR', status: 'bench', projection: 15 },
        ],
      },
    ];

    render(<Recommendations teams={highPriorityTeam} loading={false} />);

    expect(screen.getByText(/High Priority/i)).toBeInTheDocument();
  });

  it('should allow dismissing recommendations', () => {
    render(<Recommendations teams={mockTeams} loading={false} />);

    const dismissButton = screen.getByText(/Dismiss/i);
    fireEvent.click(dismissButton);

    // Recommendation should be removed
    expect(screen.queryByText(/Player 1/i)).not.toBeInTheDocument();
  });

  it('should show make swap button', () => {
    render(<Recommendations teams={mockTeams} loading={false} />);

    expect(screen.getByText(/Make Swap/i)).toBeInTheDocument();
  });

  it('should handle player swap action', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<Recommendations teams={mockTeams} loading={false} />);

    const swapButton = screen.getByText(/Make Swap/i);
    fireEvent.click(swapButton);

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should show loading indicator when loading', () => {
    render(<Recommendations teams={[]} loading={true} />);

    expect(screen.getByText(/Loading recommendations.../i)).toBeInTheDocument();
  });

  it('should sort recommendations by priority', () => {
    const multipleRecommendations = [
      {
        id: '1',
        league_name: 'League 1',
        team_name: 'Team 1',
        platform: 'Sleeper',
        players: [
          { id: '1', name: 'Low Priority', team: 'NYG', position: 'RB', status: 'starting', projection: 10 },
          { id: '2', name: 'Low Bench', team: 'DAL', position: 'WR', status: 'bench', projection: 11 },
          { id: '3', name: 'High Priority', team: 'NYG', position: 'RB', status: 'starting', projection: 5 },
          { id: '4', name: 'High Bench', team: 'DAL', position: 'WR', status: 'bench', projection: 15 },
        ],
      },
    ];

    render(<Recommendations teams={multipleRecommendations} loading={false} />);

    const recommendations = screen.getAllByText(/Consider Benching/i);
    expect(recommendations.length).toBeGreaterThan(0);
  });

  it('should display league and platform information', () => {
    render(<Recommendations teams={mockTeams} loading={false} />);

    expect(screen.getByText(/Team 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Sleeper/i)).toBeInTheDocument();
  });
});

