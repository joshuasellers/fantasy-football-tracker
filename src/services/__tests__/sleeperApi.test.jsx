import { SleeperApiService } from '../sleeperApi';

// Mock fetch globally
global.fetch = jest.fn();

describe('SleeperApiService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('getUser', () => {
    it('should fetch user data successfully', async () => {
      const mockUser = { user_id: '123', username: 'testuser' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const result = await SleeperApiService.getUser('testuser');
      expect(result).toEqual(mockUser);
      expect(fetch).toHaveBeenCalledWith('https://api.sleeper.app/v1/user/testuser');
    });

    it('should throw error when user not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(SleeperApiService.getUser('invalid')).rejects.toThrow('User not found');
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(SleeperApiService.getUser('testuser')).rejects.toThrow('Network error');
    });
  });

  describe('getUserLeagues', () => {
    it('should fetch user leagues for current season', async () => {
      const mockLeagues = [{ league_id: '1', name: 'League 1' }];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeagues,
      });

      const result = await SleeperApiService.getUserLeagues('123');
      expect(result).toEqual(mockLeagues);
      const currentYear = new Date().getFullYear();
      expect(fetch).toHaveBeenCalledWith(`https://api.sleeper.app/v1/user/123/leagues/nfl/${currentYear}`);
    });

    it('should fetch user leagues for specific season', async () => {
      const mockLeagues = [{ league_id: '1', name: 'League 1' }];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeagues,
      });

      const result = await SleeperApiService.getUserLeagues('123', 2023);
      expect(result).toEqual(mockLeagues);
      expect(fetch).toHaveBeenCalledWith('https://api.sleeper.app/v1/user/123/leagues/nfl/2023');
    });

    it('should throw error when fetch fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(SleeperApiService.getUserLeagues('123')).rejects.toThrow('Failed to fetch leagues');
    });
  });

  describe('getLeague', () => {
    it('should fetch league details successfully', async () => {
      const mockLeague = { league_id: '1', name: 'Test League' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeague,
      });

      const result = await SleeperApiService.getLeague('1');
      expect(result).toEqual(mockLeague);
      expect(fetch).toHaveBeenCalledWith('https://api.sleeper.app/v1/league/1');
    });

    it('should throw error when league not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(SleeperApiService.getLeague('invalid')).rejects.toThrow('Failed to fetch league');
    });
  });

  describe('getLeagueRosters', () => {
    it('should fetch league rosters successfully', async () => {
      const mockRosters = [{ roster_id: '1', owner_id: '123' }];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRosters,
      });

      const result = await SleeperApiService.getLeagueRosters('1');
      expect(result).toEqual(mockRosters);
      expect(fetch).toHaveBeenCalledWith('https://api.sleeper.app/v1/league/1/rosters');
    });
  });

  describe('getLeagueUsers', () => {
    it('should fetch league users successfully', async () => {
      const mockUsers = [{ user_id: '123', display_name: 'User 1' }];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      });

      const result = await SleeperApiService.getLeagueUsers('1');
      expect(result).toEqual(mockUsers);
      expect(fetch).toHaveBeenCalledWith('https://api.sleeper.app/v1/league/1/users');
    });
  });

  describe('getLeagueMatchups', () => {
    it('should fetch league matchups for specific week', async () => {
      const mockMatchups = [{ matchup_id: '1', roster_id: '1', points: 100 }];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMatchups,
      });

      const result = await SleeperApiService.getLeagueMatchups('1', 5);
      expect(result).toEqual(mockMatchups);
      expect(fetch).toHaveBeenCalledWith('https://api.sleeper.app/v1/league/1/matchups/5');
    });
  });

  describe('getNflState', () => {
    it('should fetch NFL state successfully', async () => {
      const mockState = { week: 5, season: 2024 };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockState,
      });

      const result = await SleeperApiService.getNflState();
      expect(result).toEqual(mockState);
      expect(fetch).toHaveBeenCalledWith('https://api.sleeper.app/v1/state/nfl');
    });
  });

  describe('getAllPlayers', () => {
    it('should fetch all players successfully', async () => {
      const mockPlayers = { '123': { first_name: 'John', last_name: 'Doe' } };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlayers,
      });

      const result = await SleeperApiService.getAllPlayers();
      expect(result).toEqual(mockPlayers);
      expect(fetch).toHaveBeenCalledWith('https://api.sleeper.app/v1/players/nfl');
    });
  });

  describe('getTrendingPlayers', () => {
    it('should fetch trending players with default parameters', async () => {
      const mockTrending = [{ player_id: '123', count: 10 }];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrending,
      });

      const result = await SleeperApiService.getTrendingPlayers();
      expect(result).toEqual(mockTrending);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.sleeper.app/v1/players/nfl/trending/add?lookback_hours=24&limit=25'
      );
    });

    it('should fetch trending players with custom parameters', async () => {
      const mockTrending = [{ player_id: '123', count: 5 }];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrending,
      });

      const result = await SleeperApiService.getTrendingPlayers('drop', 48, 10);
      expect(result).toEqual(mockTrending);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.sleeper.app/v1/players/nfl/trending/drop?lookback_hours=48&limit=10'
      );
    });

    it('should return empty array on error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await SleeperApiService.getTrendingPlayers();
      expect(result).toEqual([]);
    });
  });
});

