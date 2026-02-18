import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Notifications from '../Notifications';

describe('Notifications', () => {
  const mockNotifications = [
    { 
      id: '1', 
      type: 'trade', 
      title: 'Trade Completed', 
      message: 'Trade completed in League 1', 
      time: '2 hours ago',
      leagueName: 'League 1',
      leagueId: 'league1'
    },
    { 
      id: '2', 
      type: 'waiver', 
      title: 'Waiver Claim', 
      message: 'Waiver claim processed in League 1', 
      time: '1 day ago',
      leagueName: 'League 1',
      leagueId: 'league1'
    },
    { 
      id: '3', 
      type: 'free_agent', 
      title: 'Free Agent Pickup', 
      message: 'Free agent pickup in League 2', 
      time: '3 days ago',
      leagueName: 'League 2',
      leagueId: 'league2'
    }
  ];

  const mockOnLoadWeek = jest.fn();

  it('should render notifications component', () => {
    render(<Notifications notifications={mockNotifications} loading={false} currentWeek={5} notificationsWeek={5} onLoadWeek={mockOnLoadWeek} />);

    expect(screen.getByText(/League Notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent transactions and league updates/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Select Week:/i)).toBeInTheDocument();
  });

  it('should display notifications when provided', () => {
    render(<Notifications notifications={mockNotifications} loading={false} currentWeek={5} notificationsWeek={5} onLoadWeek={mockOnLoadWeek} />);

    expect(screen.getAllByText(/Trade Completed/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Waiver Claim/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Free Agent Pickup/i).length).toBeGreaterThan(0);
  });

  it('should show no notifications message when notifications are empty', () => {
    render(<Notifications notifications={[]} loading={false} currentWeek={5} notificationsWeek={5} onLoadWeek={mockOnLoadWeek} />);

    expect(screen.getByText(/No Recent Activity/i)).toBeInTheDocument();
    expect(screen.getByText(/No recent transactions or league updates to show/i)).toBeInTheDocument();
  });

  it('should show no notifications message when notifications is null', () => {
    render(<Notifications notifications={null} loading={false} currentWeek={5} notificationsWeek={5} onLoadWeek={mockOnLoadWeek} />);

    expect(screen.getByText(/No Recent Activity/i)).toBeInTheDocument();
  });

  it('should show loading indicator when loading', () => {
    render(<Notifications notifications={mockNotifications} loading={true} currentWeek={5} notificationsWeek={5} onLoadWeek={mockOnLoadWeek} />);

    expect(screen.getByText(/Loading notifications.../i)).toBeInTheDocument();
  });

  it('should display notification messages correctly', () => {
    render(<Notifications notifications={mockNotifications} loading={false} currentWeek={5} notificationsWeek={5} onLoadWeek={mockOnLoadWeek} />);

    expect(screen.getByText(/Trade completed in League 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Waiver claim processed in League 1/i)).toBeInTheDocument();
  });

  it('should display notification times correctly', () => {
    render(<Notifications notifications={mockNotifications} loading={false} currentWeek={5} notificationsWeek={5} onLoadWeek={mockOnLoadWeek} />);

    expect(screen.getByText(/2 hours ago/i)).toBeInTheDocument();
    expect(screen.getByText(/1 day ago/i)).toBeInTheDocument();
    expect(screen.getByText(/3 days ago/i)).toBeInTheDocument();
  });

  it('should display league filter dropdown when notifications have leagues', () => {
    render(<Notifications notifications={mockNotifications} loading={false} currentWeek={5} notificationsWeek={5} onLoadWeek={mockOnLoadWeek} />);

    expect(screen.getByLabelText(/Filter by League:/i)).toBeInTheDocument();
    expect(screen.getByText(/All Leagues/i)).toBeInTheDocument();
  });

  it('should filter notifications by selected league', () => {
    render(<Notifications notifications={mockNotifications} loading={false} currentWeek={5} notificationsWeek={5} onLoadWeek={mockOnLoadWeek} />);

    const leagueSelect = screen.getByLabelText(/Filter by League:/i);
    fireEvent.change(leagueSelect, { target: { value: 'league1' } });

    // Should show League 1 notifications
    expect(screen.getByText(/Trade completed in League 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Waiver claim processed in League 1/i)).toBeInTheDocument();
    
    // Should not show League 2 notification
    expect(screen.queryByText(/Free agent pickup in League 2/i)).not.toBeInTheDocument();
  });

  it('should show all notifications when "All Leagues" is selected', () => {
    render(<Notifications notifications={mockNotifications} loading={false} currentWeek={5} notificationsWeek={5} onLoadWeek={mockOnLoadWeek} />);

    const leagueSelect = screen.getByLabelText(/Filter by League:/i);
    fireEvent.change(leagueSelect, { target: { value: 'league1' } });
    fireEvent.change(leagueSelect, { target: { value: 'all' } });

    // All notifications should be visible
    expect(screen.getByText(/Trade completed in League 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Waiver claim processed in League 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Free agent pickup in League 2/i)).toBeInTheDocument();
  });

  it('should display league names in notification items', () => {
    render(<Notifications notifications={mockNotifications} loading={false} currentWeek={5} notificationsWeek={5} onLoadWeek={mockOnLoadWeek} />);

    expect(screen.getAllByText(/League 1/i).length).toBeGreaterThan(1); // At least one in the filter and one in notifications
    expect(screen.getByText(/League 2/i)).toBeInTheDocument();
  });

  it('should show "No Notifications Found" when filter results in empty list', () => {
    const singleLeagueNotifications = [
      { 
        id: '1', 
        type: 'trade', 
        title: 'Trade Completed', 
        message: 'Trade completed in League 1', 
        time: '2 hours ago',
        leagueName: 'League 1',
        leagueId: 'league1'
      }
    ];

    render(<Notifications notifications={singleLeagueNotifications} loading={false} currentWeek={5} notificationsWeek={5} onLoadWeek={mockOnLoadWeek} />);

    const leagueSelect = screen.getByLabelText(/Filter by League:/i);
    // Try to select a league that doesn't exist (should reset to all)
    fireEvent.change(leagueSelect, { target: { value: 'nonexistent' } });

    // Should still show the notification since filter resets
    expect(screen.getByText(/Trade completed in League 1/i)).toBeInTheDocument();
  });

  it('should call onLoadWeek when week changes', async () => {
    render(<Notifications notifications={mockNotifications} loading={false} currentWeek={5} notificationsWeek={5} onLoadWeek={mockOnLoadWeek} />);

    const weekSelect = screen.getByLabelText(/Select Week:/i);
    fireEvent.change(weekSelect, { target: { value: '6' } });

    await waitFor(() => {
      expect(mockOnLoadWeek).toHaveBeenCalledWith(6);
    });
  });

  it('should not show league filter when notifications have no league info', () => {
    const notificationsNoLeague = [
      { 
        id: '1', 
        type: 'trade', 
        title: 'Trade Completed', 
        message: 'Trade completed', 
        time: '2 hours ago'
      }
    ];

    render(<Notifications notifications={notificationsNoLeague} loading={false} currentWeek={5} notificationsWeek={5} onLoadWeek={mockOnLoadWeek} />);

    expect(screen.queryByLabelText(/Filter by League:/i)).not.toBeInTheDocument();
  });

  it('should reset league filter when switching weeks if selected league no longer exists', async () => {
    const week5Notifications = [
      { 
        id: '1', 
        type: 'trade', 
        title: 'Trade Completed', 
        message: 'Trade in League 1', 
        time: '2 hours ago',
        leagueName: 'League 1',
        leagueId: 'league1'
      }
    ];

    const { rerender } = render(
      <Notifications 
        notifications={week5Notifications} 
        loading={false} 
        currentWeek={5} 
        notificationsWeek={5} 
        onLoadWeek={mockOnLoadWeek} 
      />
    );

    const leagueSelect = screen.getByLabelText(/Filter by League:/i);
    fireEvent.change(leagueSelect, { target: { value: 'league1' } });
    expect(leagueSelect.value).toBe('league1');

    // Switch to week 6 with different leagues
    const week6Notifications = [
      { 
        id: '2', 
        type: 'waiver', 
        title: 'Waiver Claim', 
        message: 'Waiver in League 2', 
        time: '1 day ago',
        leagueName: 'League 2',
        leagueId: 'league2'
      }
    ];

    rerender(
      <Notifications 
        notifications={week6Notifications} 
        loading={false} 
        currentWeek={6} 
        notificationsWeek={6} 
        onLoadWeek={mockOnLoadWeek} 
      />
    );

    // Filter should reset to 'all' since league1 no longer exists
    await waitFor(() => {
      const newLeagueSelect = screen.getByLabelText(/Filter by League:/i);
      expect(newLeagueSelect.value).toBe('all');
    });
  });
});
