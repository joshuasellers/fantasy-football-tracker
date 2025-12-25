import React from 'react';
import { render, screen } from '@testing-library/react';
import Notifications from '../Notifications';

describe('Notifications', () => {
  const mockNotifications = [
    { 
      id: '1', 
      type: 'trade', 
      title: 'Trade Completed', 
      message: 'Trade completed in League 1', 
      time: '2 hours ago',
      leagueName: 'League 1'
    },
    { 
      id: '2', 
      type: 'waiver', 
      title: 'Waiver Claim', 
      message: 'Waiver claim processed in League 1', 
      time: '1 day ago',
      leagueName: 'League 1'
    },
    { 
      id: '3', 
      type: 'free_agent', 
      title: 'Free Agent Pickup', 
      message: 'Free agent pickup in League 2', 
      time: '3 days ago',
      leagueName: 'League 2'
    }
  ];

  it('should render notifications component', () => {
    render(<Notifications notifications={mockNotifications} loading={false} />);

    expect(screen.getByText(/League Notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent transactions and league updates/i)).toBeInTheDocument();
  });

  it('should display notifications when provided', () => {
    render(<Notifications notifications={mockNotifications} loading={false} />);

    expect(screen.getAllByText(/Trade Completed/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Waiver Claim/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Free Agent Pickup/i).length).toBeGreaterThan(0);
  });

  it('should show no notifications message when notifications are empty', () => {
    render(<Notifications notifications={[]} loading={false} />);

    expect(screen.getByText(/No Recent Activity/i)).toBeInTheDocument();
    expect(screen.getByText(/No recent transactions or league updates to show/i)).toBeInTheDocument();
  });

  it('should show no notifications message when notifications is null', () => {
    render(<Notifications notifications={null} loading={false} />);

    expect(screen.getByText(/No Recent Activity/i)).toBeInTheDocument();
  });

  it('should show loading indicator when loading', () => {
    render(<Notifications notifications={mockNotifications} loading={true} />);

    expect(screen.getByText(/Loading notifications.../i)).toBeInTheDocument();
  });

  it('should display notification messages correctly', () => {
    render(<Notifications notifications={mockNotifications} loading={false} />);

    expect(screen.getByText(/Trade completed in League 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Waiver claim processed in League 1/i)).toBeInTheDocument();
  });

  it('should display notification times correctly', () => {
    render(<Notifications notifications={mockNotifications} loading={false} />);

    expect(screen.getByText(/2 hours ago/i)).toBeInTheDocument();
    expect(screen.getByText(/1 day ago/i)).toBeInTheDocument();
    expect(screen.getByText(/3 days ago/i)).toBeInTheDocument();
  });
});
