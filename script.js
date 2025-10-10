// Fantasy Football Roster Tracker JavaScript

class FantasyTracker {
    constructor() {
        this.currentSection = 'dashboard';
        this.teams = [];
        this.notifications = [];
        this.matchups = [];
        this.transactions = [];
        this.currentWeek = 1;
        this.allWeeksData = {};
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
            } else if (e.target.id === 'refresh-week') {
                this.refreshWeekData();
            }
        });

        // Week selector
        document.getElementById('week-select').addEventListener('change', (e) => {
            this.loadWeekData(e.target.value);
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
        // Initialize with empty data - real data will be loaded from Sleeper API
        this.teams = [];
        this.notifications = [];
    }

    updateDashboard() {
        // Update active teams count
        const activeTeamsElement = document.getElementById('active-teams');
        if (activeTeamsElement) {
            activeTeamsElement.textContent = this.teams.length > 0 ? this.teams.length : '-';
        }

        // Calculate lineup alerts (players with low projections)
        const lineupAlertsElement = document.getElementById('lineup-alerts');
        if (lineupAlertsElement) {
            const lineupAlerts = this.teams.length > 0 ? this.calculateLineupAlerts() : 0;
            lineupAlertsElement.textContent = lineupAlerts > 0 ? lineupAlerts : '-';
        }

        // Update notifications count
        const notificationsCountElement = document.getElementById('notifications-count');
        if (notificationsCountElement) {
            const unreadNotifications = this.notifications.length > 0 ? this.notifications.filter(n => !n.read).length : 0;
            notificationsCountElement.textContent = unreadNotifications > 0 ? unreadNotifications : '-';
        }

        // Find best projection
        const bestProjectionElement = document.getElementById('best-projection');
        if (bestProjectionElement) {
            const bestProjection = this.teams.length > 0 ? this.findBestProjection() : 0;
            bestProjectionElement.textContent = bestProjection > 0 ? bestProjection : '-';
        }

        // Update recommendations
        this.updateRecommendations();
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

    generateRecommendations() {
        const recommendations = [];
        
        this.teams.forEach(team => {
            const startingPlayers = team.players.filter(p => p.status === 'starting');
            const benchPlayers = team.players.filter(p => p.status === 'bench');
            
            startingPlayers.forEach(starter => {
                const betterBenchOption = benchPlayers.find(bench => bench.projection > starter.projection);
                if (betterBenchOption) {
                    recommendations.push({
                        teamId: team.id,
                        teamName: team.name,
                        platform: team.platform,
                        starter: starter,
                        benchOption: betterBenchOption,
                        priority: this.calculatePriority(starter.projection, betterBenchOption.projection)
                    });
                }
            });
        });
        
        return recommendations.sort((a, b) => b.priority.value - a.priority.value);
    }

    calculatePriority(starterProjection, benchProjection) {
        const difference = benchProjection - starterProjection;
        if (difference >= 5) return { level: 'High', value: 3 };
        if (difference >= 2) return { level: 'Medium', value: 2 };
        return { level: 'Low', value: 1 };
    }

    updateRecommendations() {
        const recommendations = this.generateRecommendations();
        const container = document.getElementById('recommendations-container');
        
        // Clear existing recommendations
        container.innerHTML = '';
        
        if (recommendations.length === 0) {
            container.innerHTML = `
                <div class="no-recommendations">
                    <i class="fas fa-check-circle"></i>
                    <h3>No Recommendations</h3>
                    <p>Your lineups look optimal! All your starting players have better projections than your bench options.</p>
                </div>
            `;
            return;
        }
        
        recommendations.forEach(rec => {
            const recCard = document.createElement('div');
            recCard.className = 'recommendation-card';
            recCard.innerHTML = `
                <div class="recommendation-header">
                    <h3><i class="fas fa-arrow-down"></i> Consider Benching</h3>
                    <span class="alert-badge">${rec.priority.level} Priority</span>
                </div>
                <div class="recommendation-context">
                    <span class="league-info"><i class="fas fa-trophy"></i> ${rec.teamName}</span>
                    <span class="team-info"><i class="fas fa-users"></i> ${rec.platform}</span>
                </div>
                <div class="player-comparison">
                    <div class="current-starter">
                        <h4>Currently Starting</h4>
                        <div class="player-card">
                            <div class="player-info">
                                <span class="player-name">${rec.starter.name}</span>
                                <span class="player-team">${rec.starter.team}</span>
                            </div>
                            <div class="player-stats">
                                <span class="projection">Proj: ${rec.starter.projection}</span>
                                <span class="status starting">Starting</span>
                            </div>
                        </div>
                    </div>
                    <div class="vs-divider">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                    <div class="bench-option">
                        <h4>Better Option on Bench</h4>
                        <div class="player-card">
                            <div class="player-info">
                                <span class="player-name">${rec.benchOption.name}</span>
                                <span class="player-team">${rec.benchOption.team}</span>
                            </div>
                            <div class="player-stats">
                                <span class="projection">Proj: ${rec.benchOption.projection}</span>
                                <span class="status bench">On Bench</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="recommendation-actions">
                    <button class="btn btn-primary" data-starter="${rec.starter.name}" data-bench="${rec.benchOption.name}" data-team="${rec.teamId}">Make Swap</button>
                    <button class="btn btn-secondary" data-rec-id="${rec.teamId}-${rec.starter.name}">Dismiss</button>
                </div>
            `;
            container.appendChild(recCard);
        });
    }

    updateWeekSelector() {
        const weekSelect = document.getElementById('week-select');
        if (!weekSelect) return;

        // Clear existing options
        weekSelect.innerHTML = '<option value="">Choose a week...</option>';

        // Add weeks 1-18 (typical NFL season)
        for (let week = 1; week <= 18; week++) {
            const option = document.createElement('option');
            option.value = week;
            option.textContent = `Week ${week}`;
            if (week === this.currentWeek) {
                option.textContent += ' (Current)';
                option.selected = true;
            }
            weekSelect.appendChild(option);
        }
    }

    async loadWeekData(week) {
        if (!week || week === this.currentWeek) {
            this.updateScoringTab();
            return;
        }

        try {
            this.showNotification(`Loading Week ${week} data...`, 'info');
            
            // Check if we already have this week's data
            if (this.allWeeksData[week]) {
                this.matchups = this.allWeeksData[week];
                this.updateScoringTab();
                return;
            }

            // Fetch new week data
            const weekMatchups = [];
            for (const team of this.teams) {
                const leagueId = team.id;
                try {
                    const matchupsResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`);
                    const matchups = await matchupsResponse.json();
                    weekMatchups.push(...matchups);
                } catch (error) {
                    console.error(`Error fetching week ${week} data for league ${leagueId}:`, error);
                }
            }

            // Store the data
            this.allWeeksData[week] = weekMatchups;
            this.matchups = weekMatchups;
            this.updateScoringTab();
            
            this.showNotification(`Week ${week} data loaded!`, 'success');
        } catch (error) {
            console.error('Error loading week data:', error);
            this.showNotification('Failed to load week data', 'error');
        }
    }

    async refreshWeekData() {
        const selectedWeek = document.getElementById('week-select').value;
        if (selectedWeek) {
            // Clear cached data for this week
            delete this.allWeeksData[selectedWeek];
            await this.loadWeekData(selectedWeek);
        } else {
            // Refresh current week
            await this.loadWeekData(this.currentWeek);
        }
    }

    updateScoringTab() {
        const scoringGrid = document.querySelector('.scoring-grid');
        if (!scoringGrid || !this.matchups || this.matchups.length === 0) {
            if (scoringGrid) {
                scoringGrid.innerHTML = `
                    <div class="no-scoring-data">
                        <i class="fas fa-chart-line"></i>
                        <h3>No Scoring Data</h3>
                        <p>No matchup data available for the selected week.</p>
                    </div>
                `;
            }
            return;
        }

        scoringGrid.innerHTML = '';

        // Group matchups by league and create score cards
        const matchupsByLeague = {};
        this.matchups.forEach(matchup => {
            const team = this.teams.find(t => t.roster_id === matchup.roster_id);
            if (team) {
                if (!matchupsByLeague[team.name]) {
                    matchupsByLeague[team.name] = [];
                }
                matchupsByLeague[team.name].push({ matchup, team });
            }
        });

        Object.entries(matchupsByLeague).forEach(([leagueName, leagueMatchups]) => {
            leagueMatchups.forEach(({ matchup, team }) => {
                const scoreCard = document.createElement('div');
                scoreCard.className = 'team-score-card';
                
                // Calculate position scores
                const positionScores = this.calculatePositionScores(matchup);
                
                scoreCard.innerHTML = `
                    <h3>${team.name} (${leagueName})</h3>
                    <div class="score-display">
                        <span class="current-score">${matchup.points || 0}</span>
                        <span class="projected-score">Proj: ${this.calculateProjectedScore(matchup)}</span>
                    </div>
                    <div class="score-breakdown">
                        <div class="position-score">
                            ${positionScores.map(pos => `<span>${pos.position}: ${pos.points}</span>`).join('')}
                        </div>
                    </div>
                    <div class="matchup-info">
                        <span class="week-info">Week ${matchup.matchup_id || this.getSelectedWeek()}</span>
                        <span class="opponent-info">vs ${this.getOpponentName(matchup, leagueMatchups)}</span>
                    </div>
                `;
                scoringGrid.appendChild(scoreCard);
            });
        });
    }

    getSelectedWeek() {
        const weekSelect = document.getElementById('week-select');
        return weekSelect ? weekSelect.value || this.currentWeek : this.currentWeek;
    }

    calculatePositionScores(matchup) {
        // This would need player data to calculate actual position scores
        // For now, return mock data based on matchup points
        const totalPoints = matchup.points || 0;
        return [
            { position: 'QB', points: (totalPoints * 0.25).toFixed(1) },
            { position: 'RB', points: (totalPoints * 0.3).toFixed(1) },
            { position: 'WR', points: (totalPoints * 0.25).toFixed(1) },
            { position: 'TE', points: (totalPoints * 0.1).toFixed(1) },
            { position: 'K', points: (totalPoints * 0.05).toFixed(1) },
            { position: 'DEF', points: (totalPoints * 0.05).toFixed(1) }
        ];
    }

    calculateProjectedScore(matchup) {
        // Sleeper doesn't provide projections in the matchup data
        // This would need to be calculated from player projections
        return ((matchup.points || 0) * 1.2).toFixed(1);
    }

    getOpponentName(matchup, leagueMatchups) {
        // Find the opponent in the same matchup
        const opponent = leagueMatchups.find(m => 
            m.matchup.matchup_id === matchup.matchup_id && 
            m.matchup.roster_id !== matchup.roster_id
        );
        return opponent ? opponent.team.name : 'TBD';
    }

    updateNotificationsTab() {
        const notificationsList = document.querySelector('.notifications-list');
        if (!notificationsList || !this.transactions || this.transactions.length === 0) return;

        notificationsList.innerHTML = '';

        // Process recent transactions into notifications
        const recentTransactions = this.transactions
            .filter(t => t.status === 'complete' || t.status === 'pending')
            .slice(0, 10) // Show last 10 transactions
            .sort((a, b) => new Date(b.created) - new Date(a.created));

        if (recentTransactions.length === 0) {
            notificationsList.innerHTML = `
                <div class="no-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <h3>No Recent Activity</h3>
                    <p>No recent transactions or league updates to show.</p>
                </div>
            `;
            return;
        }

        recentTransactions.forEach(transaction => {
            const notification = document.createElement('div');
            notification.className = 'notification-item';
            
            const notificationData = this.processTransactionToNotification(transaction);
            
            notification.innerHTML = `
                <div class="notification-icon">
                    <i class="${notificationData.icon}"></i>
                </div>
                <div class="notification-content">
                    <h4>${notificationData.title}</h4>
                    <p>${notificationData.message}</p>
                    <span class="notification-time">${this.formatTimeAgo(transaction.created)}</span>
                </div>
                <div class="notification-actions">
                    <button class="btn btn-sm btn-primary">View</button>
                </div>
            `;
            notificationsList.appendChild(notification);
        });
    }

    processTransactionToNotification(transaction) {
        const timeAgo = this.formatTimeAgo(transaction.created);
        
        switch (transaction.type) {
            case 'trade':
                return {
                    icon: 'fas fa-exchange-alt',
                    title: 'Trade Completed',
                    message: `Trade completed in ${transaction.leagueName}`,
                    time: timeAgo
                };
            case 'waiver':
                return {
                    icon: 'fas fa-user-plus',
                    title: 'Waiver Claim',
                    message: `Waiver claim processed in ${transaction.leagueName}`,
                    time: timeAgo
                };
            case 'free_agent':
                return {
                    icon: 'fas fa-user-plus',
                    title: 'Free Agent Pickup',
                    message: `Free agent pickup in ${transaction.leagueName}`,
                    time: timeAgo
                };
            case 'drop':
                return {
                    icon: 'fas fa-user-minus',
                    title: 'Player Dropped',
                    message: `Player dropped in ${transaction.leagueName}`,
                    time: timeAgo
                };
            default:
                return {
                    icon: 'fas fa-info-circle',
                    title: 'League Update',
                    message: `Activity in ${transaction.leagueName}`,
                    time: timeAgo
                };
        }
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
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
        if (!container) return;

        container.innerHTML = '';

        if (!team || !team.players || team.players.length === 0) {
            container.innerHTML = `
                <div class="no-lineup-data">
                    <i class="fas fa-users"></i>
                    <h3>No Lineup Data</h3>
                    <p>No player data available for this team</p>
                </div>
            `;
            return;
        }

        const startingPlayers = team.players.filter(p => p.status === 'starting');
        
        if (startingPlayers.length === 0) {
            container.innerHTML = `
                <div class="no-lineup-data">
                    <i class="fas fa-users"></i>
                    <h3>No Starting Lineup</h3>
                    <p>No starting players found for this team</p>
                </div>
            `;
            return;
        }
        
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
                        <span class="projection">Proj: ${player.projection || '-'}</span>
                        <span class="status starting">Starting</span>
                    </div>
                </div>
            `;
            container.appendChild(lineupCard);
        });
    }

    handlePlayerSwap(button) {
        const starterName = button.dataset.starter;
        const benchName = button.dataset.bench;
        const teamId = button.dataset.team;

        // Find the specific team and make the swap
        const team = this.teams.find(t => t.id === teamId);
        if (team) {
            const starter = team.players.find(p => p.name === starterName);
            const bench = team.players.find(p => p.name === benchName);
            
            if (starter && bench) {
                starter.status = 'bench';
                bench.status = 'starting';
                
                // Show success message with team context
                this.showNotification(`Player swap completed in ${team.name}!`, 'success');
                
                // Update dashboard and recommendations
                this.updateDashboard();
            }
        }
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
            
            return { league, rosters, users, matchups, currentWeek, nflState };
        } catch (error) {
            console.error('Sleeper League Data Error:', error);
            throw error;
        }
    }

    async getSleeperTransactions(leagueId) {
        try {
            const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/transactions`);
            const transactions = await response.json();
            return transactions;
        } catch (error) {
            console.error('Sleeper Transactions Error:', error);
            return [];
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
            const allMatchups = [];
            const allTransactions = [];
            
            for (const league of leagues) {
                const leagueData = await this.getSleeperLeagueData(league.league_id);
                const convertedTeam = this.convertSleeperDataToInternal(leagueData, playersData, user.user_id);
                if (convertedTeam) {
                    convertedTeams.push(convertedTeam);
                    allMatchups.push(...leagueData.matchups);
                }
                
                // Get transactions for notifications
                const transactions = await this.getSleeperTransactions(league.league_id);
                allTransactions.push(...transactions.map(t => ({ ...t, leagueName: league.name })));
            }
            
            // Update the teams array
            this.teams = convertedTeams;
            this.matchups = allMatchups;
            this.transactions = allTransactions;
            
            // Store current week data
            this.allWeeksData[this.currentWeek] = allMatchups;
            
            this.updateDashboard();
            this.updateLeagueSelector();
            this.updateWeekSelector();
            this.updateScoringTab();
            this.updateNotificationsTab();
            
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
