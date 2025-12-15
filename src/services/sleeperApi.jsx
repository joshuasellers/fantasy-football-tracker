// Sleeper API service
const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

export class SleeperApiService {
  // Get user by username
  static async getUser(username) {
    try {
      const response = await fetch(`${SLEEPER_BASE_URL}/user/${username}`);
      if (!response.ok) {
        throw new Error('User not found');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Get user's leagues for current season
  static async getUserLeagues(userId, season = new Date().getFullYear()) {
    try {
      const response = await fetch(`${SLEEPER_BASE_URL}/user/${userId}/leagues/nfl/${season}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leagues');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user leagues:', error);
      throw error;
    }
  }

  // Get league details
  static async getLeague(leagueId) {
    try {
      const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch league');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching league:', error);
      throw error;
    }
  }

  // Get league rosters
  static async getLeagueRosters(leagueId) {
    try {
      const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/rosters`);
      if (!response.ok) {
        throw new Error('Failed to fetch rosters');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching rosters:', error);
      throw error;
    }
  }

  // Get league users
  static async getLeagueUsers(leagueId) {
    try {
      const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get league matchups for specific week
  static async getLeagueMatchups(leagueId, week) {
    try {
      const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/matchups/${week}`);
      if (!response.ok) {
        throw new Error('Failed to fetch matchups');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching matchups:', error);
      throw error;
    }
  }

  // Get NFL state (current week, season info)
  static async getNflState() {
    try {
      const response = await fetch(`${SLEEPER_BASE_URL}/state/nfl`);
      if (!response.ok) {
        throw new Error('Failed to fetch NFL state');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching NFL state:', error);
      throw error;
    }
  }

  // Get all players (use sparingly - large file)
  static async getAllPlayers() {
    try {
      const response = await fetch(`${SLEEPER_BASE_URL}/players/nfl`);
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  }

  // Get trending players
  static async getTrendingPlayers(type = 'add', lookbackHours = 24, limit = 25) {
    try {
      const response = await fetch(
        `${SLEEPER_BASE_URL}/players/nfl/trending/${type}?lookback_hours=${lookbackHours}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch trending players');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching trending players:', error);
      return [];
    }
  }
}

export default SleeperApiService;
