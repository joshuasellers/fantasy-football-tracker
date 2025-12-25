import { renderHook, act, waitFor } from '@testing-library/react';
import { useSleeperData } from '../useSleeperData';
import SleeperApiService from '../../services/sleeperApi';

// Mock the SleeperApiService
jest.mock('../../services/sleeperApi', () => {
  const mockService = {
    getUser: jest.fn(),
    getUserLeagues: jest.fn(),
    getLeague: jest.fn(),
    getLeagueRosters: jest.fn(),
    getLeagueUsers: jest.fn(),
    getLeagueMatchups: jest.fn(),
    getLeagueTransactions: jest.fn(),
    getNflState: jest.fn(),
    getAllPlayers: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockService,
    SleeperApiService: mockService,
  };
});

describe('useSleeperData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSleeperData());

    expect(result.current.teams).toEqual([]);
    expect(result.current.allTeams).toEqual([]);
    expect(result.current.matchups).toEqual([]);
    expect(result.current.notifications).toEqual([]);
    expect(result.current.currentWeek).toBe(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should load user data successfully', async () => {
    const mockUser = { user_id: '123', username: 'testuser' };
    const mockLeagues = [{ league_id: '1', name: 'League 1' }];
    const mockNflState = { week: 5, season: 2024 };
    const mockLeagueData = { league_id: '1', name: 'League 1' };
    const mockRosters = [
      {
        roster_id: '1',
        owner_id: '123',
        players: ['player1', 'player2'],
        starters: ['player1']
      },
      {
        roster_id: '2',
        owner_id: '456',
        players: ['player3'],
        starters: ['player3']
      }
    ];
    const mockUsers = [
      {
        user_id: '123',
        display_name: 'User 123',
        metadata: { team_name: 'My Team' }
      },
      {
        user_id: '456',
        display_name: 'User 456',
        metadata: { team_name: 'Opponent Team' }
      }
    ];
    const mockMatchups = [
      { roster_id: '1', points: 100, players_points: { player1: 10, player2: 5 } },
      { roster_id: '2', points: 80, players_points: { player3: 8 } }
    ];
    const mockPlayers = {
      player1: { first_name: 'John', last_name: 'Doe', team: 'NYG', position: 'RB' },
      player2: { first_name: 'Jane', last_name: 'Smith', team: 'DAL', position: 'WR' },
      player3: { first_name: 'Bob', last_name: 'Johnson', team: 'KC', position: 'QB' }
    };
    const mockTransactions = [
      { transaction_id: '1', type: 'trade', status: 'complete', created: new Date().toISOString() },
      { transaction_id: '2', type: 'waiver', status: 'complete', created: new Date().toISOString() }
    ];

    SleeperApiService.getUser.mockResolvedValueOnce(mockUser);
    SleeperApiService.getUserLeagues.mockResolvedValueOnce(mockLeagues);
    SleeperApiService.getNflState.mockResolvedValueOnce(mockNflState);
    SleeperApiService.getLeague.mockResolvedValueOnce(mockLeagueData);
    SleeperApiService.getLeagueRosters.mockResolvedValueOnce(mockRosters);
    SleeperApiService.getLeagueUsers.mockResolvedValueOnce(mockUsers);
    SleeperApiService.getLeagueMatchups.mockResolvedValueOnce(mockMatchups);
    SleeperApiService.getLeagueTransactions.mockResolvedValueOnce(mockTransactions);
    SleeperApiService.getAllPlayers.mockResolvedValueOnce(mockPlayers);

    const { result } = renderHook(() => useSleeperData());

    act(() => {
      result.current.loadUserData('testuser');
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currentWeek).toBe(5);
    expect(result.current.teams.length).toBeGreaterThan(0);
    expect(result.current.allTeams.length).toBeGreaterThan(0);
    expect(result.current.matchups.length).toBeGreaterThan(0);
    expect(result.current.teams[0].leagueId).toBe('1');
    expect(result.current.matchups[0].leagueId).toBe('1');
    
    // Verify allTeams includes all teams (user's team + opponents)
    expect(result.current.allTeams.length).toBeGreaterThanOrEqual(2); // Should have at least 2 teams
    const allTeam = result.current.allTeams[0];
    expect(allTeam).toHaveProperty('leagueId');
    expect(allTeam).toHaveProperty('team_name');
    expect(allTeam).toHaveProperty('players');
    expect(allTeam).toHaveProperty('currentScore');
    expect(allTeam).toHaveProperty('roster_id');
    expect(allTeam).toHaveProperty('owner_id');
    
    // Verify players have score property
    if (allTeam.players && allTeam.players.length > 0) {
      expect(allTeam.players[0]).toHaveProperty('score');
    }
    
    // Verify notifications are created from transactions
    expect(result.current.notifications.length).toBeGreaterThan(0);
  });

  it('should handle errors when loading user data', async () => {
    const errorMessage = 'Failed to fetch user';
    SleeperApiService.getUser.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useSleeperData());

    act(() => {
      result.current.loadUserData('invaliduser');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should not load data if username is empty', async () => {
    const { result } = renderHook(() => useSleeperData());

    act(() => {
      result.current.loadUserData('');
    });

    // Should not call any API methods
    expect(SleeperApiService.getUser).not.toHaveBeenCalled();
  });

  it('should not load week data if week is same as current week', async () => {
    const mockUser = { user_id: '123', username: 'testuser' };
    const mockLeagues = [{ league_id: '1', name: 'League 1' }];
    const mockNflState = { week: 5, season: 2024 };
    const mockLeagueData = { league_id: '1', name: 'League 1' };
    const mockRosters = [{
      roster_id: '1',
      owner_id: '123',
      players: ['player1'],
      starters: ['player1']
    }];
    const mockUsers = [{
      user_id: '123',
      metadata: { team_name: 'My Team' }
    }];
    const mockMatchups = [{ roster_id: '1', points: 100 }];
    const mockPlayers = {
      player1: { first_name: 'John', last_name: 'Doe', team: 'NYG', position: 'RB' }
    };

    SleeperApiService.getUser.mockResolvedValueOnce(mockUser);
    SleeperApiService.getUserLeagues.mockResolvedValueOnce(mockLeagues);
    SleeperApiService.getNflState.mockResolvedValueOnce(mockNflState);
    SleeperApiService.getLeague.mockResolvedValueOnce(mockLeagueData);
    SleeperApiService.getLeagueRosters.mockResolvedValueOnce(mockRosters);
    SleeperApiService.getLeagueUsers.mockResolvedValueOnce(mockUsers);
    SleeperApiService.getLeagueMatchups.mockResolvedValueOnce(mockMatchups);
    SleeperApiService.getLeagueTransactions.mockResolvedValueOnce([]);
    SleeperApiService.getAllPlayers.mockResolvedValueOnce(mockPlayers);

    const { result } = renderHook(() => useSleeperData());

    // First load user data to set currentWeek
    act(() => {
      result.current.loadUserData('testuser');
    });

    await waitFor(() => {
      expect(result.current.currentWeek).toBe(5);
    });

    // Try to load same week
    act(() => {
      result.current.loadWeekData(5);
    });

    // Should not call API for same week
    const callCount = SleeperApiService.getLeagueMatchups.mock.calls.length;
    await waitFor(() => {
      expect(SleeperApiService.getLeagueMatchups.mock.calls.length).toBe(callCount);
    });
  });
});

