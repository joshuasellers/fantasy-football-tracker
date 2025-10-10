# Fantasy Football Roster Tracker

A comprehensive web application to help you track and manage your fantasy football rosters across multiple leagues and platforms.

## Features

### 🏈 Starting Lineups
- View who is starting today across all your teams
- League-specific lineup management
- Support for both Sleeper and ESPN leagues

### 📊 Bench Recommendations
- Intelligent analysis to identify players you should consider benching
- Compare starting players with better bench options
- One-click player swaps with confirmation

### 📈 Live Scoring & Notifications
- Real-time scoring updates for all your teams
- League notifications and alerts
- Trade proposals, waiver claims, and injury updates

### 📱 Responsive Design
- Modern, mobile-friendly interface
- Beautiful gradient backgrounds and smooth animations
- Intuitive navigation between sections

## Getting Started

1. **Clone or Download** this repository to your local machine
2. **Open** `index.html` in your web browser
3. **Connect to Sleeper**: Enter your Sleeper username in the "Starting Lineups" section
4. **Navigate** through the different sections using the top navigation

### Using with Real Sleeper Data

1. Go to the "Starting Lineups" section
2. Enter your Sleeper username in the connection form
3. Click "Connect to Sleeper" to load your real league data
4. Select your league from the dropdown to view your actual roster

## File Structure

```
fantasy-football-tracker/
├── index.html          # Main HTML file
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Current Status

This application includes:

- ✅ Complete UI/UX design
- ✅ Interactive navigation and sections
- ✅ **Sleeper API Integration** - *Fully Implemented*
- ✅ Sample data for demonstration
- ✅ Responsive design for all devices
- 🔄 **ESPN API Integration** - *Coming Soon*

## API Integration Roadmap

### Sleeper API ✅ COMPLETED
- ✅ User authentication via username
- ✅ League data fetching
- ✅ Real-time roster updates
- ✅ Live scoring integration
- ✅ Player data mapping
- ✅ Matchup data retrieval

### ESPN API
- League connection
- Player statistics
- Projection data
- Notification system

## Customization

You can easily customize the application by:

1. **Modifying sample data** in `script.js` (loadSampleData function)
2. **Updating styling** in `styles.css`
3. **Adding new features** by extending the FantasyTracker class

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

**Built with ❤️ for fantasy football enthusiasts**
