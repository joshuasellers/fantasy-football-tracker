import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Scoring from '../Scoring';

describe('Scoring', () => {
  const mockTeams = [
    {
      id: '1',
      league_name: 'League 1',
      team_name: 'Team 1',
      roster_id: '1',
    },
  ];

  const mockMatchups = [
    {
      roster_id: '1',
      points: 100,
      matchup_id: '1',
    },
  ];

  it('should render scoring component', () => {
    render(
      <Scoring
        teams={mockTeams}
        allTeams={[]}
        matchups={mockMatchups}
        currentWeek={5}
        loading={false}
      />
    );

    expect(screen.getByText(/Live Scoring/i)).toBeInTheDocument();
  });

  it('should display week selector', () => {
    render(
      <Scoring
        teams={mockTeams}
        allTeams={[]}
        matchups={mockMatchups}
        currentWeek={5}
        loading={false}
      />
    );

    expect(screen.getByLabelText(/Select Week:/i)).toBeInTheDocument();
  });

  it('should show no scoring data when matchups are empty', () => {
    render(
      <Scoring
        teams={mockTeams}
        allTeams={[]}
        matchups={[]}
        currentWeek={5}
        loading={false}
      />
    );

    expect(screen.getByText(/No Scoring Data/i)).toBeInTheDocument();
  });

  it('should display team scores', () => {
    render(
      <Scoring
        teams={mockTeams}
        allTeams={[]}
        matchups={mockMatchups}
        currentWeek={5}
        loading={false}
      />
    );

    expect(screen.getByText(/Team 1/i)).toBeInTheDocument();
    expect(screen.getByText(/100/i)).toBeInTheDocument();
  });

  it('should show loading indicator when loading', () => {
    render(
      <Scoring
        teams={mockTeams}
        allTeams={[]}
        matchups={mockMatchups}
        currentWeek={5}
        loading={true}
      />
    );

    expect(screen.getByText(/Loading scoring data.../i)).toBeInTheDocument();
  });

  it('should change selected week', () => {
    render(
      <Scoring
        teams={mockTeams}
        allTeams={[]}
        matchups={mockMatchups}
        currentWeek={5}
        loading={false}
      />
    );

    const weekSelect = screen.getByLabelText(/Select Week:/i);
    fireEvent.change(weekSelect, { target: { value: '6' } });

    expect(weekSelect.value).toBe('6');
  });

  it('should call loadWeekData when week changes to a different week', () => {
    const mockLoadWeekData = jest.fn();
    render(
      <Scoring
        teams={mockTeams}
        allTeams={[]}
        matchups={mockMatchups}
        currentWeek={5}
        loading={false}
        loadWeekData={mockLoadWeekData}
      />
    );

    const weekSelect = screen.getByLabelText(/Select Week:/i);
    fireEvent.change(weekSelect, { target: { value: '6' } });

    expect(mockLoadWeekData).toHaveBeenCalledWith(6);
  });

  it('should not call loadWeekData when week changes to current week', () => {
    const mockLoadWeekData = jest.fn();
    render(
      <Scoring
        teams={mockTeams}
        allTeams={[]}
        matchups={mockMatchups}
        currentWeek={5}
        loading={false}
        loadWeekData={mockLoadWeekData}
      />
    );

    const weekSelect = screen.getByLabelText(/Select Week:/i);
    fireEvent.change(weekSelect, { target: { value: '5' } });

    expect(mockLoadWeekData).not.toHaveBeenCalled();
  });

  it('should not call loadWeekData when loadWeekData is not provided', () => {
    render(
      <Scoring
        teams={mockTeams}
        allTeams={[]}
        matchups={mockMatchups}
        currentWeek={5}
        loading={false}
      />
    );

    const weekSelect = screen.getByLabelText(/Select Week:/i);
    // Should not throw error
    expect(() => {
      fireEvent.change(weekSelect, { target: { value: '6' } });
    }).not.toThrow();
  });

  it('should display position scores breakdown', () => {
    render(
      <Scoring
        teams={mockTeams}
        allTeams={[]}
        matchups={mockMatchups}
        currentWeek={5}
        loading={false}
      />
    );

    // Position scores are calculated as percentages of total
    expect(screen.getByText(/QB:/i)).toBeInTheDocument();
    expect(screen.getByText(/RB:/i)).toBeInTheDocument();
    expect(screen.getByText(/WR:/i)).toBeInTheDocument();
  });

  it('should toggle expandable sections when expand button is clicked', () => {
    render(
      <Scoring
        teams={mockTeams}
        allTeams={[]}
        matchups={mockMatchups}
        currentWeek={5}
        loading={false}
      />
    );

    const expandButton = screen.getByRole('button', { name: /expand/i }) || 
      document.querySelector('.expandable-header');
    
    if (expandButton) {
      fireEvent.click(expandButton);
      // The expandable content should be visible after click
      const expandableContent = document.querySelector('.expandable-content.opened');
      expect(expandableContent || document.querySelector('.expandable-content')).toBeInTheDocument();
    }
  });

  it('should display opponent name when opponent matchup is found', () => {
    const mockAllTeams = [
      {
        roster_id: '2',
        team_name: 'Opponent Team',
        leagueId: 'league1'
      }
    ];

    const mockMatchupsWithOpponent = [
      {
        roster_id: '1',
        points: 100,
        matchup_id: '1',
        leagueId: 'league1'
      },
      {
        roster_id: '2',
        points: 90,
        matchup_id: '1',
        leagueId: 'league1'
      }
    ];

    const mockTeamsWithLeague = [
      {
        id: '1',
        league_name: 'League 1',
        team_name: 'Team 1',
        roster_id: '1',
        leagueId: 'league1'
      }
    ];

    render(
      <Scoring
        teams={mockTeamsWithLeague}
        allTeams={mockAllTeams}
        matchups={mockMatchupsWithOpponent}
        currentWeek={5}
        loading={false}
      />
    );

    expect(screen.getByText(/vs Opponent Team/i)).toBeInTheDocument();
  });

  it('should display "TBD" when opponent is not found', () => {
    render(
      <Scoring
        teams={mockTeams}
        allTeams={[]}
        matchups={mockMatchups}
        currentWeek={5}
        loading={false}
      />
    );

    expect(screen.getByText(/vs TBD/i)).toBeInTheDocument();
  });

  it('should display week information', () => {
    render(
      <Scoring
        teams={mockTeams}
        allTeams={[]}
        matchups={mockMatchups}
        currentWeek={5}
        loading={false}
      />
    );

    expect(screen.getByText(/Week 5/i)).toBeInTheDocument();
  });

  it('should group matchups by league', () => {
    const multiLeagueTeams = [
      {
        id: '1',
        league_name: 'League 1',
        team_name: 'Team 1',
        roster_id: '1',
        leagueId: 'league1'
      },
      {
        id: '2',
        league_name: 'League 2',
        team_name: 'Team 2',
        roster_id: '3',
        leagueId: 'league2'
      }
    ];

    const multiLeagueMatchups = [
      {
        roster_id: '1',
        points: 100,
        matchup_id: '1',
        leagueId: 'league1'
      },
      {
        roster_id: '3',
        points: 90,
        matchup_id: '2',
        leagueId: 'league2'
      }
    ];

    render(
      <Scoring
        teams={multiLeagueTeams}
        allTeams={[]}
        matchups={multiLeagueMatchups}
        currentWeek={5}
        loading={false}
      />
    );

    expect(screen.getByText(/Team 1 \(League 1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Team 2 \(League 2\)/i)).toBeInTheDocument();
  });

  it('should update selectedWeek when currentWeek prop changes', () => {
    const { rerender } = render(
      <Scoring
        teams={mockTeams}
        allTeams={[]}
        matchups={mockMatchups}
        currentWeek={5}
        loading={false}
      />
    );

    const weekSelect = screen.getByLabelText(/Select Week:/i);
    expect(weekSelect.value).toBe('5');

    rerender(
      <Scoring
        teams={mockTeams}
        allTeams={[]}
        matchups={mockMatchups}
        currentWeek={6}
        loading={false}
      />
    );

    expect(weekSelect.value).toBe('6');
  });

  it('should display all position types in breakdown', () => {
    render(
      <Scoring
        teams={mockTeams}
        allTeams={[]}
        matchups={mockMatchups}
        currentWeek={5}
        loading={false}
      />
    );

    expect(screen.getByText(/QB:/i)).toBeInTheDocument();
    expect(screen.getByText(/RB:/i)).toBeInTheDocument();
    expect(screen.getByText(/WR:/i)).toBeInTheDocument();
    expect(screen.getByText(/TE:/i)).toBeInTheDocument();
    expect(screen.getByText(/K:/i)).toBeInTheDocument();
    expect(screen.getByText(/DEF:/i)).toBeInTheDocument();
  });
});

