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
});

