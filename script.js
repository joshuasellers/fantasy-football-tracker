// Fantasy Football Roster Tracker JavaScript

class FantasyTracker {
    constructor() {
        this.currentSection = 'dashboard';
        this.teams = [];
        this.notifications = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSampleData();
        this.updateDashboard();
        this.autoLoadUserData();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.showSection(section);
            });
        });

        // League selector
        document.getElementById('league-select').addEventListener('change', (e) => {
            this.loadLeagueData(e.target.value);
        });

        // Scoring tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.showTab(tab);
            });
        });

        // Recommendation actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-primary') && e.target.textContent === 'Make Swap') {
                this.handlePlayerSwap(e.target);
            } else if (e.target.classList.contains('btn-secondary') && e.target.textContent === 'Dismiss') {
                this.dismissRecommendation(e.target);
            } else if (e.target.id === 'connect-sleeper') {
                this.handleSleeperConnection();
            }
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionName).classList.add('active');
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        this.currentSection = sectionName;
    }

    showTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Remove active class from tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    loadSampleData() {
        // Sample team data (will be replaced by real Sleeper data)
        this.teams = [
            {
                id: 'sleeper-1',
                name: 'Sleeper League 1',
                platform: 'Sleeper',
                players: [
                    { name: 'Josh Allen', team: 'BUF', position: 'QB', projection: 24.5, status: 'starting' },
                    { name: 'Christian McCaffrey', team: 'SF', position: 'RB', projection: 18.2, status: 'starting' },
                    { name: 'Tyreek Hill', team: 'MIA', position: 'WR', projection: 16.8, status: 'starting' },
                    { name: 'Mike Evans', team: 'TB', position: 'WR', projection: 8.5, status: 'starting' },
                    { name: 'Stefon Diggs', team: 'BUF', position: 'WR', projection: 12.3, status: 'bench' }
                ],
                currentScore: 87.5,
                projectedScore: 142.3
            }
        ];

        // Sample notifications
        this.notifications = [
            {
                id: 1,
                type: 'trade',
                title: 'Trade Proposal',
                message: 'You received a trade offer in Sleeper League 1',
                time: '2 hours ago',
                read: false
            },
            {
                id: 2,
                type: 'waiver',
                title: 'Waiver Claim',
                message: 'Your waiver claim for Tyler Lockett was successful',
                time: '1 day ago',
                read: false
            },
            {
                id: 3,
                type: 'injury',
                title: 'Lineup Alert',
                message: 'Player injury update: Check your starting lineup',
                time: '3 hours ago',
                read: false
            }
        ];
    }

    updateDashboard() {
        // Update active teams count
        document.getElementById('active-teams').textContent = this.teams.length;

        // Calculate lineup alerts (players with low projections)
        const lineupAlerts = this.calculateLineupAlerts();
        document.getElementById('lineup-alerts').textContent = lineupAlerts;

        // Update notifications count
        const unreadNotifications = this.notifications.filter(n => !n.read).length;
        document.getElementById('notifications-count').textContent = unreadNotifications;

        // Find best projection
        const bestProjection = this.findBestProjection();
        document.getElementById('best-projection').textContent = bestProjection;
    }

    calculateLineupAlerts() {
        let alerts = 0;
        this.teams.forEach(team => {
            const startingPlayers = team.players.filter(p => p.status === 'starting');
            const benchPlayers = team.players.filter(p => p.status === 'bench');
            
            startingPlayers.forEach(starter => {
                const betterBenchOption = benchPlayers.find(bench => bench.projection > starter.projection);
                if (betterBenchOption) {
                    alerts++;
                }
            });
        });
        return alerts;
    }

    findBestProjection() {
        let best = 0;
        this.teams.forEach(team => {
            team.players.forEach(player => {
                if (player.projection > best) {
                    best = player.projection;
                }
            });
        });
        return best.toFixed(1);
    }

    loadLeagueData(leagueId) {
        if (!leagueId) return;

        const team = this.teams.find(t => t.id === leagueId);
        if (!team) return;

        this.updateLineupDisplay(team);
    }

    updateLineupDisplay(team) {
        const container = document.getElementById('lineup-container');
        container.innerHTML = '';

        const startingPlayers = team.players.filter(p => p.status === 'starting');
        
        startingPlayers.forEach(player => {
            const lineupCard = document.createElement('div');
            lineupCard.className = 'lineup-card';
            lineupCard.innerHTML = `
                <h3>${player.position} - Starting</h3>
                <div class="player-card">
                    <div class="player-info">
                        <span class="player-name">${player.name}</span>
                        <span class="player-team">${player.team}</span>
                    </div>
                    <div class="player-stats">
                        <span class="projection">Proj: ${player.projection}</span>
                        <span class="status starting">Starting</span>
                    </div>
                </div>
            `;
            container.appendChild(lineupCard);
        });
    }

    handlePlayerSwap(button) {
        const recommendationCard = button.closest('.recommendation-card');
        const starterName = recommendationCard.querySelector('.current-starter .player-name').textContent;
        const benchName = recommendationCard.querySelector('.bench-option .player-name').textContent;

        // Simulate swap
        this.teams.forEach(team => {
            const starter = team.players.find(p => p.name === starterName);
            const bench = team.players.find(p => p.name === benchName);
            
            if (starter && bench) {
                starter.status = 'bench';
                bench.status = 'starting';
            }
        });

        // Show success message
        this.showNotification('Player swap completed!', 'success');
        
        // Remove recommendation card
        recommendationCard.remove();
        
        // Update dashboard
        this.updateDashboard();
    }

    dismissRecommendation(button) {
        const recommendationCard = button.closest('.recommendation-card');
        recommendationCard.remove();
        this.showNotification('Recommendation dismissed', 'info');
    }

    async handleSleeperConnection() {
        const username = document.getElementById('sleeper-username').value.trim();
        if (!username) {
            this.showNotification('Please enter your Sleeper username', 'error');
            return;
        }

        const button = document.getElementById('connect-sleeper');
        const originalText = button.textContent;
        button.textContent = 'Connecting...';
        button.disabled = true;

        try {
            await this.loadRealSleeperData(username);
            this.showNotification('Successfully connected to Sleeper!', 'success');
            
            // Update league selector with real leagues
            this.updateLeagueSelector();
        } catch (error) {
            this.showNotification('Failed to connect to Sleeper. Please check your username.', 'error');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    updateLeagueSelector() {
        const selector = document.getElementById('league-select');
        selector.innerHTML = '<option value="">Choose a league...</option>';
        
        this.teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.id;
            option.textContent = `${team.name} (${team.platform}) - ${team.players.length} players`;
            selector.appendChild(option);
        });
        
        // Auto-select first league if available
        if (this.teams.length > 0) {
            selector.value = this.teams[0].id;
            this.loadLeagueData(this.teams[0].id);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Sleeper API Integration
    async connectToSleeperAPI(username) {
        try {
            // Get user by username
            const userResponse = await fetch(`https://api.sleeper.app/v1/user/${username}`);
            const user = await userResponse.json();
            
            if (!user.user_id) {
                throw new Error('User not found');
            }
            
            // Get user's leagues for current season
            const currentSeason = new Date().getFullYear();
            const leaguesResponse = await fetch(`https://api.sleeper.app/v1/user/${user.user_id}/leagues/nfl/${currentSeason}`);
            const leagues = await leaguesResponse.json();
            
            return { user, leagues };
        } catch (error) {
            console.error('Sleeper API Error:', error);
            throw error;
        }
    }

    async getSleeperLeagueData(leagueId) {
        try {
            // Get league details
            const leagueResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}`);
            const league = await leagueResponse.json();
            
            // Get rosters
            const rostersResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
            const rosters = await rostersResponse.json();
            
            // Get users
            const usersResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`);
            const users = await usersResponse.json();
            
            // Get current week matchups
            const nflStateResponse = await fetch('https://api.sleeper.app/v1/state/nfl');
            const nflState = await nflStateResponse.json();
            const currentWeek = nflState.week;
            
            const matchupsResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${currentWeek}`);
            const matchups = await matchupsResponse.json();
            
            return { league, rosters, users, matchups, currentWeek };
        } catch (error) {
            console.error('Sleeper League Data Error:', error);
            throw error;
        }
    }

    async getSleeperPlayers() {
        try {
            // This should be called sparingly (once per day max)
            const response = await fetch('https://api.sleeper.app/v1/players/nfl');
            const players = await response.json();
            return players;
        } catch (error) {
            console.error('Sleeper Players Error:', error);
            throw error;
        }
    }

    async connectToESPNAPI() {
        // TODO: ESPN API integration coming soon
        console.log('ESPN API integration planned for future release');
        this.showNotification('ESPN integration coming soon!', 'info');
        // Would implement actual API calls here
    }

    async syncLeagueData() {
        // TODO: Multi-platform sync coming soon (Sleeper + ESPN)
        console.log('Multi-platform sync planned for future release');
        this.showNotification('Multi-platform sync coming soon!', 'info');
        // Would implement actual sync logic here
    }

    // Convert Sleeper API data to our internal format
    convertSleeperDataToInternal(sleeperData, playersData, userId) {
        const { league, rosters, users, matchups } = sleeperData;
        
        // Find user's roster
        const userRoster = rosters.find(roster => roster.owner_id === userId);
        if (!userRoster) return null;

        // Get user info
        const userInfo = users.find(user => user.user_id === userRoster.owner_id);
        
        // Convert roster players to our format
        const convertedPlayers = userRoster.players.map(playerId => {
            const player = playersData[playerId];
            if (!player) {
                // Handle case where player data is missing
                return {
                    id: playerId,
                    name: `Player ${playerId}`,
                    team: 'UNK',
                    position: 'UNK',
                    projection: 0,
                    status: userRoster.starters.includes(playerId) ? 'starting' : 'bench',
                    injury_status: null,
                    news_updated: null
                };
            }
            
            // Check if player is starting
            const isStarting = userRoster.starters.includes(playerId);
            
            return {
                id: playerId,
                name: `${player.first_name} ${player.last_name}`,
                team: player.team || 'UNK',
                position: player.position || 'UNK',
                projection: 0, // Sleeper doesn't provide projections in this endpoint
                status: isStarting ? 'starting' : 'bench',
                injury_status: player.injury_status,
                news_updated: player.news_updated
            };
        });

        // Get current matchup data
        const currentMatchup = matchups.find(matchup => matchup.roster_id === userRoster.roster_id);
        
        return {
            id: league.league_id,
            name: league.name,
            platform: 'Sleeper',
            players: convertedPlayers,
            currentScore: currentMatchup ? currentMatchup.points : 0,
            projectedScore: 0, // Would need additional API call for projections
            roster_id: userRoster.roster_id,
            settings: userRoster.settings
        };
    }

    // Auto-load user data on page load
    async autoLoadUserData() {
        const username = 'jselles216'; // Your username
        const loadingIndicator = document.getElementById('loading-indicator');
        
        try {
            loadingIndicator.style.display = 'block';
            this.showNotification('Loading your Sleeper leagues...', 'info');
            await this.loadRealSleeperData(username);
            this.showNotification('Successfully loaded your leagues!', 'success');
        } catch (error) {
            console.error('Error auto-loading user data:', error);
            this.showNotification('Could not load your leagues automatically. You can try connecting manually.', 'error');
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    // Example usage method
    async loadRealSleeperData(username) {
        try {
            // Get user and leagues
            const { user, leagues } = await this.connectToSleeperAPI(username);
            
            // Get players data (should be cached)
            const playersData = await this.getSleeperPlayers();
            
            // Process each league
            const convertedTeams = [];
            for (const league of leagues) {
                const leagueData = await this.getSleeperLeagueData(league.league_id);
                const convertedTeam = this.convertSleeperDataToInternal(leagueData, playersData, user.user_id);
                if (convertedTeam) {
                    convertedTeams.push(convertedTeam);
                }
            }
            
            // Update the teams array
            this.teams = convertedTeams;
            this.updateDashboard();
            this.updateLeagueSelector();
            
            return convertedTeams;
        } catch (error) {
            console.error('Error loading Sleeper data:', error);
            this.showNotification('Failed to load Sleeper data', 'error');
            throw error;
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new FantasyTracker();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FantasyTracker;
}
