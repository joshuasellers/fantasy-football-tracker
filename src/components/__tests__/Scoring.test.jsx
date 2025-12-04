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

  const mockTransactions = [
    {
      transaction_id: '1',
      type: 'trade',
      status: 'complete',
      created: new Date().toISOString(),
      leagueName: 'League 1',
    },
  ];

  it('should render scoring component', () => {
    render(
      <Scoring
        teams={mockTeams}
        matchups={mockMatchups}
        transactions={mockTransactions}
        currentWeek={5}
        loading={false}
      />
    );

    expect(screen.getByText(/Scoring & League Notifications/i)).toBeInTheDocument();
  });

  it('should render tabs', () => {
    render(
      <Scoring
        teams={mockTeams}
        matchups={mockMatchups}
        transactions={mockTransactions}
        currentWeek={5}
        loading={false}
      />
    );

    expect(screen.getByText(/Live Scoring/i)).toBeInTheDocument();
    expect(screen.getByText(/League Updates/i)).toBeInTheDocument();
  });

  it('should switch between tabs', () => {
    render(
      <Scoring
        teams={mockTeams}
        matchups={mockMatchups}
        transactions={mockTransactions}
        currentWeek={5}
        loading={false}
      />
    );

    const notificationsTab = screen.getByText(/League Updates/i);
    fireEvent.click(notificationsTab);

    expect(screen.getAllByText(/Trade Completed/i).length).toBeGreaterThan(0);
  });

  it('should display week selector', () => {
    render(
      <Scoring
        teams={mockTeams}
        matchups={mockMatchups}
        transactions={mockTransactions}
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
        matchups={[]}
        transactions={mockTransactions}
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
        matchups={mockMatchups}
        transactions={mockTransactions}
        currentWeek={5}
        loading={false}
      />
    );

    expect(screen.getByText(/Team 1/i)).toBeInTheDocument();
    expect(screen.getByText(/100/i)).toBeInTheDocument();
  });

  it('should show no notifications when transactions are empty', () => {
    render(
      <Scoring
        teams={mockTeams}
        matchups={mockMatchups}
        transactions={[]}
        currentWeek={5}
        loading={false}
      />
    );

    const notificationsTab = screen.getByText(/League Updates/i);
    fireEvent.click(notificationsTab);

    expect(screen.getByText(/No Recent Activity/i)).toBeInTheDocument();
  });

  it('should display transaction notifications', () => {
    render(
      <Scoring
        teams={mockTeams}
        matchups={mockMatchups}
        transactions={mockTransactions}
        currentWeek={5}
        loading={false}
      />
    );

    const notificationsTab = screen.getByText(/League Updates/i);
    fireEvent.click(notificationsTab);

    expect(screen.getAllByText(/Trade Completed/i).length).toBeGreaterThan(0);
  });

  it('should show loading indicator when loading', () => {
    render(
      <Scoring
        teams={mockTeams}
        matchups={mockMatchups}
        transactions={mockTransactions}
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
        matchups={mockMatchups}
        transactions={mockTransactions}
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
        matchups={mockMatchups}
        transactions={mockTransactions}
        currentWeek={5}
        loading={false}
      />
    );

    // Position scores are calculated as percentages of total
    expect(screen.getByText(/QB:/i)).toBeInTheDocument();
    expect(screen.getByText(/RB:/i)).toBeInTheDocument();
    expect(screen.getByText(/WR:/i)).toBeInTheDocument();
  });

  it('should format time ago correctly', () => {
    const recentTransaction = [
      {
        transaction_id: '1',
        type: 'waiver',
        status: 'complete',
        created: new Date(Date.now() - 30000).toISOString(), // 30 seconds ago
        leagueName: 'League 1',
      },
    ];

    render(
      <Scoring
        teams={mockTeams}
        matchups={mockMatchups}
        transactions={recentTransaction}
        currentWeek={5}
        loading={false}
      />
    );

    const notificationsTab = screen.getByText(/League Updates/i);
    fireEvent.click(notificationsTab);

    expect(screen.getByText(/Just now/i)).toBeInTheDocument();
  });
});

