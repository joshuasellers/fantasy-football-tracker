import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  const mockLoadUserData = jest.fn();

  beforeEach(() => {
    mockLoadUserData.mockClear();
  });

  it('should render lineup component', () => {
    render(<Lineups teams={mockTeams} loading={false} onLoadUserData={mockLoadUserData} />);

    expect(screen.getByText(/Starting Lineups/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Connect to Sleeper/i).length).toBeGreaterThan(0);
  });

  it('should display league selector', () => {
    render(<Lineups teams={mockTeams} loading={false} onLoadUserData={mockLoadUserData} />);

    expect(screen.getByLabelText(/Select League:/i)).toBeInTheDocument();
  });

  it('should show no lineup data message when no league is selected', () => {
    render(<Lineups teams={mockTeams} loading={false} onLoadUserData={mockLoadUserData} />);

    expect(screen.getByText(/Select a league to view your starting lineup/i)).toBeInTheDocument();
  });

  it('should display starting players when league is selected', () => {
    render(<Lineups teams={mockTeams} loading={false} onLoadUserData={mockLoadUserData} />);

    const select = screen.getByLabelText(/Select League:/i);
    fireEvent.change(select, { target: { value: '1' } });

    expect(screen.getByText(/Player 1/i)).toBeInTheDocument();
    expect(screen.getByText(/RB - Starting/i)).toBeInTheDocument();
    expect(screen.queryByText(/Player 2/i)).not.toBeInTheDocument(); // Bench player should not show
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

    render(<Lineups teams={teamsNoStarters} loading={false} onLoadUserData={mockLoadUserData} />);

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

    render(<Lineups teams={teamsNoPlayers} loading={false} onLoadUserData={mockLoadUserData} />);

    const select = screen.getByLabelText(/Select League:/i);
    fireEvent.change(select, { target: { value: '1' } });

    expect(screen.getByText(/No Lineup Data/i)).toBeInTheDocument();
  });

  it('should handle connect button click', async () => {
    mockLoadUserData.mockResolvedValueOnce();

    render(<Lineups teams={mockTeams} loading={false} onLoadUserData={mockLoadUserData} />);

    const input = screen.getByPlaceholderText(/Enter your Sleeper username/i);
    const buttons = screen.getAllByText(/Connect to Sleeper/i);
    const button = buttons.find(btn => btn.tagName === 'BUTTON') || buttons[0];

    fireEvent.change(input, { target: { value: 'testuser' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLoadUserData).toHaveBeenCalledWith('testuser');
    });
  });

  it('should disable connect button when connecting', () => {
    render(<Lineups teams={mockTeams} loading={false} onLoadUserData={mockLoadUserData} />);

    const buttons = screen.getAllByText(/Connect to Sleeper/i);
    const button = buttons.find(btn => btn.tagName === 'BUTTON') || buttons[0];
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByText(/Connecting.../i)).toBeInTheDocument();
  });

  it('should not call onLoadUserData when username is empty', () => {
    render(<Lineups teams={mockTeams} loading={false} onLoadUserData={mockLoadUserData} />);

    const input = screen.getByPlaceholderText(/Enter your Sleeper username/i);
    fireEvent.change(input, { target: { value: '' } });

    const buttons = screen.getAllByText(/Connect to Sleeper/i);
    const button = buttons.find(btn => btn.tagName === 'BUTTON') || buttons[0];
    fireEvent.click(button);

    // Should not call with empty string, but may have been called with default value on mount
    const calls = mockLoadUserData.mock.calls;
    const emptyCalls = calls.filter(call => !call[0] || call[0].trim() === '');
    expect(emptyCalls.length).toBe(0);
  });

  it('should show loading indicator when loading', () => {
    render(<Lineups teams={mockTeams} loading={true} onLoadUserData={mockLoadUserData} />);

    expect(screen.getByText(/Loading your leagues.../i)).toBeInTheDocument();
  });

  it('should display correct league information in selector', () => {
    render(<Lineups teams={mockTeams} loading={false} onLoadUserData={mockLoadUserData} />);

    expect(screen.getByText(/League 1 \(Sleeper\) - 2 players/i)).toBeInTheDocument();
  });
});

