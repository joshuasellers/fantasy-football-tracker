# Fantasy Football Roster Tracker (React)

A comprehensive React application to help you track and manage your fantasy football rosters across multiple leagues and platforms.

## Features

### 🏈 Starting Lineups
- View who is starting today across all your teams
- League-specific lineup management
- **Sleeper API integration** - Real-time data from your Sleeper leagues
- ESPN integration coming soon!

### 📊 Bench Recommendations
- Intelligent analysis to identify players you should consider benching
- Compare starting players with better bench options
- One-click player swaps with confirmation

### 📈 Live Scoring & Notifications
- Real-time scoring updates for all your teams
- Week-by-week matchup viewing
- League notifications and alerts
- Trade proposals, waiver claims, and injury updates

### 📱 Modern React Architecture
- Component-based architecture
- React Router for navigation
- Custom hooks for data management
- Responsive design with modern CSS

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fantasy-football-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### Using with Real Sleeper Data

1. **Automatic Loading**: Your Sleeper leagues will load automatically when you open the page (username: jselles216)
2. **Manual Connection**: You can also manually enter your Sleeper username in the "Starting Lineups" section
3. **Select League**: Choose from your loaded leagues in the dropdown to view your actual roster
4. **Real-time Data**: All player information, lineups, and scores are pulled directly from Sleeper

## Project Structure

```
fantasy-football-tracker/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/             # React components
│   │   ├── Dashboard.js        # Dashboard overview
│   │   ├── Lineups.js          # Starting lineups
│   │   ├── Recommendations.js  # Bench recommendations
│   │   └── Scoring.js          # Live scoring & notifications
│   ├── hooks/                  # Custom React hooks
│   │   └── useSleeperData.js   # Sleeper API data management
│   ├── services/               # API services
│   │   └── sleeperApi.js       # Sleeper API integration
│   ├── styles/                 # CSS styles
│   │   └── App.css             # Main application styles
│   ├── App.js                  # Main App component
│   └── index.js                # Application entry point
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Current Status

This React application includes:

- ✅ **React 18** with modern hooks and components
- ✅ **React Router** for navigation
- ✅ **Custom Hooks** for data management
- ✅ **Sleeper API Integration** - *Fully Implemented*
- ✅ **Responsive Design** for all devices
- ✅ **Component Architecture** for maintainability
- 🔄 **ESPN API Integration** - *Coming Soon*

## API Integration

### Sleeper API ✅ COMPLETED
- ✅ User authentication via username
- ✅ League data fetching with React hooks
- ✅ Real-time roster updates
- ✅ Live scoring integration
- ✅ Player data mapping
- ✅ Matchup data retrieval
- ✅ Week-by-week data caching

### ESPN API (Coming Soon)
- League connection
- Player statistics
- Projection data
- Notification system
- Multi-platform roster management

## Key React Features

### Custom Hooks
- `useSleeperData` - Manages all Sleeper API data and state
- Automatic data loading and caching
- Error handling and loading states

### Component Architecture
- **Dashboard** - Overview of all teams and stats
- **Lineups** - Starting lineup management
- **Recommendations** - Bench optimization suggestions
- **Scoring** - Live scoring and notifications

### State Management
- React hooks for local state
- Custom hook for global data management
- Efficient re-rendering with proper dependencies

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

Feel free to fork this project and submit pull requests for improvements!

## License

This project is open source and available under the MIT License.

---

**Built with ❤️ and React for fantasy football enthusiasts**


---

TODO:
- team names is league names
- all players projects are 0
