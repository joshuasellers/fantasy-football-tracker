import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Lineups from '../Lineups';

describe('Lineups', () => {
  const mockTeams = [
    {
      id: '1',
      league_name: 'League 1',
      platform: 'Sleeper',
      players: [
        { id: '1', name: 'Player 1', team: 'NYG', position: 'RB', status: 'starting', projection: 10 },
        { id: '2', name: 'Player 2', team: 'DAL', position: 'WR', status: 'bench', projection: 15 },
      ],
    },
  ];

  it('should render lineup component', () => {
    render(<Lineups teams={mockTeams} loading={false} />);

    expect(screen.getByText(/Lineups/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Connect to Sleeper/i).length).toBeGreaterThan(0);
  });

  it('should display league selector', () => {
    render(<Lineups teams={mockTeams} loading={false} />);

    expect(screen.getByLabelText(/Select League:/i)).toBeInTheDocument();
  });

  it('should show no lineup data message when no league is selected', () => {
    render(<Lineups teams={mockTeams} loading={false} />);

    expect(screen.getByText(/Select a league to view your lineup/i)).toBeInTheDocument();
  });

  it('should display starting players when league is selected', () => {
    render(<Lineups teams={mockTeams} loading={false} />);

    const select = screen.getByLabelText(/Select League:/i);
    fireEvent.change(select, { target: { value: '1' } });

    expect(screen.getByText(/Player 1/i)).toBeInTheDocument();
    expect(screen.getByText(/^RB$/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Starting/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Player 2/i)).toBeInTheDocument(); // Bench should show too
    expect(screen.getByText(/^WR$/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Bench/i).length).toBeGreaterThan(0);
  });

  it('should show no starting lineup message when team has no starters', () => {
    const teamsNoStarters = [
      {
        id: '1',
        league_name: 'League 1',
        platform: 'Sleeper',
        players: [
          { id: '2', name: 'Player 2', team: 'DAL', position: 'WR', status: 'bench', projection: 15 },
        ],
      },
    ];

    render(<Lineups teams={teamsNoStarters} loading={false} />);

    const select = screen.getByLabelText(/Select League:/i);
    fireEvent.change(select, { target: { value: '1' } });

    expect(screen.getByText(/No Starting Lineup/i)).toBeInTheDocument();
  });

  it('should show no lineup data when team has no players', () => {
    const teamsNoPlayers = [
      {
        id: '1',
        league_name: 'League 1',
        platform: 'Sleeper',
        players: [],
      },
    ];

    render(<Lineups teams={teamsNoPlayers} loading={false} />);

    const select = screen.getByLabelText(/Select League:/i);
    fireEvent.change(select, { target: { value: '1' } });

    expect(screen.getByText(/No Lineup Data/i)).toBeInTheDocument();
  });

  it('should show loading indicator when loading', () => {
    render(<Lineups teams={mockTeams} loading={true} />);

    expect(screen.getByText(/Loading your leagues.../i)).toBeInTheDocument();
  });

  it('should display correct league information in selector', () => {
    render(<Lineups teams={mockTeams} loading={false} />);

    expect(screen.getByText(/League 1 \(Sleeper\) - 2 players/i)).toBeInTheDocument();
  });

  it('should group players by position', () => {
    const teamsWithMultiplePositions = [
      {
        id: '1',
        league_name: 'League 1',
        platform: 'Sleeper',
        players: [
          { id: '1', name: 'QB Player', team: 'NYG', position: 'QB', status: 'starting', projection: 10 },
          { id: '2', name: 'RB Player', team: 'DAL', position: 'RB', status: 'starting', projection: 15 },
          { id: '3', name: 'WR Player', team: 'PHI', position: 'WR', status: 'bench', projection: 12 },
        ],
      },
    ];

    render(<Lineups teams={teamsWithMultiplePositions} loading={false} />);

    const select = screen.getByLabelText(/Select League:/i);
    fireEvent.change(select, { target: { value: '1' } });

    // Should show position groups
    expect(screen.getByText(/^QB$/i)).toBeInTheDocument();
    expect(screen.getByText(/^RB$/i)).toBeInTheDocument();
    expect(screen.getByText(/^WR$/i)).toBeInTheDocument();
  });

  it('should show "No Bench Players" message when team has no bench players', () => {
    const teamsNoBench = [
      {
        id: '1',
        league_name: 'League 1',
        platform: 'Sleeper',
        players: [
          { id: '1', name: 'Player 1', team: 'NYG', position: 'RB', status: 'starting', projection: 10 },
        ],
      },
    ];

    render(<Lineups teams={teamsNoBench} loading={false} />);

    const select = screen.getByLabelText(/Select League:/i);
    fireEvent.change(select, { target: { value: '1' } });

    expect(screen.getByText(/No Bench Players/i)).toBeInTheDocument();
  });

  it('should display player information correctly', () => {
    render(<Lineups teams={mockTeams} loading={false} />);

    const select = screen.getByLabelText(/Select League:/i);
    fireEvent.change(select, { target: { value: '1' } });

    expect(screen.getByText(/Player 1/i)).toBeInTheDocument();
    expect(screen.getByText(/NYG/i)).toBeInTheDocument();
    expect(screen.getByText(/Proj: 10/i)).toBeInTheDocument();
  });

  it('should display player status correctly', () => {
    render(<Lineups teams={mockTeams} loading={false} />);

    const select = screen.getByLabelText(/Select League:/i);
    fireEvent.change(select, { target: { value: '1' } });

    expect(screen.getAllByText(/Starting/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bench/i).length).toBeGreaterThan(0);
  });

  it('should handle players with missing position', () => {
    const teamsWithUnknownPosition = [
      {
        id: '1',
        league_name: 'League 1',
        platform: 'Sleeper',
        players: [
          { id: '1', name: 'Player 1', team: 'NYG', position: null, status: 'starting', projection: 10 },
        ],
      },
    ];

    render(<Lineups teams={teamsWithUnknownPosition} loading={false} />);

    const select = screen.getByLabelText(/Select League:/i);
    fireEvent.change(select, { target: { value: '1' } });

    // Should still render the player
    expect(screen.getByText(/Player 1/i)).toBeInTheDocument();
  });

  it('should show floating connect button instructions', () => {
    render(<Lineups teams={mockTeams} loading={false} />);

    expect(screen.getByText(/Use the floating "Connect to Sleeper" button/i)).toBeInTheDocument();
  });
});

