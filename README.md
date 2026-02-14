# Fantasy Football Roster Tracker (React)

A comprehensive React application to help you track and manage your fantasy football rosters across multiple leagues and platforms. This project is built with React 18 and demonstrates modern React patterns including hooks, custom hooks, routing, and API integration.

## Table of Contents

- [What is React?](#what-is-react)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How the App Works](#how-the-app-works)
- [Key React Concepts Used](#key-react-concepts-used)
- [Component Breakdown](#component-breakdown)
- [Data Flow](#data-flow)
- [Features](#features)
- [Available Scripts](#available-scripts)
- [Planned Improvements](#planned-improvements)

## What is React?

**React** is a JavaScript library for building user interfaces. Instead of writing HTML directly, you write **components** (reusable pieces of UI) using JavaScript and a syntax called **JSX** (which looks like HTML but is actually JavaScript).

### Key React Concepts in This Project

- **Components**: Reusable pieces of UI (like `Dashboard`, `Lineups`, `Scoring`)
- **JSX**: A syntax that lets you write HTML-like code in JavaScript
- **Props**: Data passed from parent components to child components
- **State**: Data that can change over time (managed with `useState`)
- **Hooks**: Functions that let you "hook into" React features (like `useState`, `useEffect`, `useCallback`)
- **Custom Hooks**: Your own reusable hooks that encapsulate logic (like `useSleeperData`)
- **Routing**: Navigating between different pages/views (using React Router)

## Getting Started

### Prerequisites

Before you begin, make sure you have:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
  - Node.js includes `npm` (Node Package Manager), which is used to install dependencies
- A code editor (VS Code recommended)
- A basic understanding of JavaScript

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
   This command reads `package.json` and installs all the required packages (React, React Router, etc.) into the `node_modules` folder.

3. **Start the development server**
   ```bash
   npm start
   ```
   This starts a local development server. The app will automatically open in your browser at `http://localhost:3000`.

4. **View the app**
   - The app should automatically open in your browser
   - If not, navigate to `http://localhost:3000` manually
   - You'll see the Fantasy Football Roster Tracker with your Sleeper leagues loaded automatically

### Using with Real Sleeper Data

1. **Automatic Loading**: When you open the app, it automatically loads data for the username `jselles216` for the current season
2. **Change Username**: Click the floating "Connect to Sleeper" button (bottom right) to enter a different Sleeper username
3. **Change Season**: Use the season dropdown in the header to view data from previous seasons (2020-2024)
4. **View Different Weeks**: 
   - In the **Scoring** tab, use the week dropdown to view different weeks
   - In the **Notifications** tab, use the week dropdown to view notifications from different weeks

## Project Structure

Here's how the project is organized:

```
fantasy-football-tracker/
├── public/
│   └── index.html              # The HTML template that React renders into
│
├── src/                        # All your source code lives here
│   ├── index.jsx              # Entry point - where React starts rendering
│   ├── App.jsx                # Main App component (handles routing and global state)
│   │
│   ├── components/            # React components (UI pieces)
│   │   ├── Dashboard.jsx     # Overview page showing all teams
│   │   ├── Lineups.jsx       # Shows starting lineups and bench players
│   │   ├── Notifications.jsx # Shows league notifications/transactions
│   │   ├── Scoring.jsx       # Shows live scoring and matchups
│   │   ├── Updates.jsx       # Shows planned improvements and bugs from README
│   │   └── styles/
│   │       └── ExpandableSection.css  # Styles for expandable sections
│   │
│   ├── hooks/                 # Custom React hooks
│   │   └── useSleeperData.jsx # Manages all Sleeper API data fetching and state
│   │
│   ├── services/              # API integration code
│   │   └── sleeperApi.jsx     # Functions that call the Sleeper API
│   │
│   ├── styles/                # CSS stylesheets
│   │   └── App.css            # Main application styles
│   │
│   └── __tests__/             # Unit tests
│       ├── App.test.jsx
│       └── components/
│           ├── Dashboard.test.jsx
│           ├── Lineups.test.jsx
│           ├── Notifications.test.jsx
│           └── Scoring.test.jsx
│
├── package.json               # Lists dependencies and scripts
└── README.md                  # This file
```

## How the App Works

### The Entry Point: `index.jsx`

When the app starts, React looks at `src/index.jsx`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**What's happening here:**
- `ReactDOM.createRoot()` finds the `<div id="root">` element in `public/index.html`
- `root.render()` tells React to render the `<App />` component into that div
- `<React.StrictMode>` is a development tool that helps catch bugs

### The Main App: `App.jsx`

`App.jsx` is the root component that:
1. Sets up routing (navigation between pages)
2. Manages global state (username, selected season)
3. Uses the `useSleeperData` hook to fetch and manage data
4. Renders the header, navigation, and different page components

**Key parts of App.jsx:**
- **State Management**: Uses `useState` to track the current username, selected season, and loading states
- **Custom Hook**: Uses `useSleeperData()` to get all the fantasy football data
- **Routing**: Uses React Router's `<Routes>` and `<Route>` to show different components based on the URL
- **Auto-loading**: Uses `useEffect` to automatically load data when the app starts

### Data Flow

Here's how data flows through the app:

```
1. User opens app
   ↓
2. App.jsx renders and calls useSleeperData hook
   ↓
3. useSleeperData hook calls SleeperApiService functions
   ↓
4. SleeperApiService makes HTTP requests to Sleeper API
   ↓
5. API returns JSON data
   ↓
6. SleeperApiService returns data to useSleeperData
   ↓
7. useSleeperData processes and stores data in state
   ↓
8. App.jsx receives data from hook and passes it as props to components
   ↓
9. Components (Dashboard, Lineups, etc.) render with the data
```

## Key React Concepts Used

### 1. Components

**What it is**: Components are reusable pieces of UI. Think of them like LEGO blocks - you build complex UIs by combining simple components.

**Example from this project:**
```jsx
// Dashboard.jsx is a component
function Dashboard({ teams, notifications, loading }) {
  return (
    <div>
      <h2>Dashboard</h2>
      {/* Component renders teams and notifications */}
    </div>
  );
}
```

**Why it's useful**: Instead of writing one giant HTML file, you break the UI into logical pieces (Dashboard, Lineups, Scoring, etc.) that are easier to understand and maintain.

### 2. Props

**What it is**: Props (short for "properties") are how you pass data from a parent component to a child component.

**Example:**
```jsx
// In App.jsx (parent)
<Dashboard teams={teams} notifications={notifications} />

// In Dashboard.jsx (child)
function Dashboard({ teams, notifications }) {
  // teams and notifications are props
  // You can use them here to render data
}
```

**Why it's useful**: Props let you make components reusable. The same `Dashboard` component can show different data depending on what props you pass it.

### 3. State with `useState`

**What it is**: State is data that can change over time. When state changes, React automatically re-renders the component.

**Example:**
```jsx
const [username, setUsername] = useState('jselles216');
// username is the current value
// setUsername is a function to update it

// Later, to update:
setUsername('newusername');
```

**Why it's useful**: When you update state, React automatically updates the UI. For example, when you change the season dropdown, the state updates and the app fetches new data.

### 4. Effects with `useEffect`

**What it is**: `useEffect` lets you run code after a component renders. It's perfect for things like:
- Fetching data when a component loads
- Setting up subscriptions
- Cleaning up when a component unmounts

**Example:**
```jsx
useEffect(() => {
  // This runs after the component renders
  loadUserData('jselles216', selectedSeason);
}, [loadUserData]); // Only re-run if loadUserData changes
```

**Why it's useful**: It separates "what to render" (JSX) from "what to do" (side effects like API calls).

### 5. Custom Hooks

**What it is**: Custom hooks are functions that start with `use` and can use other hooks. They let you extract and reuse stateful logic.

**Example from this project:**
```jsx
// useSleeperData.jsx
export function useSleeperData() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const loadUserData = useCallback(async (username) => {
    // Fetch data from API
  }, []);
  
  return { teams, loading, loadUserData };
}

// In App.jsx
const { teams, loading, loadUserData } = useSleeperData();
```

**Why it's useful**: Instead of duplicating data-fetching logic in every component, you write it once in a custom hook and reuse it anywhere.

### 6. Routing with React Router

**What it is**: React Router lets you create a single-page application (SPA) where different URLs show different components, without refreshing the page.

**Example:**
```jsx
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/lineups" element={<Lineups />} />
  <Route path="/scoring" element={<Scoring />} />
</Routes>
```

**Why it's useful**: Users can bookmark specific pages, use browser back/forward buttons, and the URL reflects what they're viewing.

### 7. Callbacks with `useCallback`

**What it is**: `useCallback` returns a memoized version of a function that only changes if its dependencies change.

**Example:**
```jsx
const loadUserData = useCallback(async (username) => {
  // Fetch data
}, [season]); // Only recreate if season changes
```

**Why it's useful**: It prevents unnecessary re-renders and ensures functions have stable references for `useEffect` dependencies.

## Component Breakdown

### `App.jsx` - The Root Component

**Purpose**: The main component that orchestrates everything.

**Responsibilities**:
- Sets up React Router for navigation
- Manages global state (username, selected season)
- Uses `useSleeperData` hook to get all fantasy data
- Renders the header, navigation, and page components
- Handles the floating "Connect to Sleeper" button

**Key State**:
- `username`: Current Sleeper username
- `selectedSeason`: Which season/year to display
- `isConnecting`: Whether data is currently loading

**Key Functions**:
- `handleFloatingConnect()`: Prompts user for username and loads their data

### `Dashboard.jsx` - Overview Page

**Purpose**: Shows a high-level overview of all teams.

**Props**:
- `teams`: Array of user's teams
- `notifications`: Array of league notifications
- `loading`: Boolean indicating if data is loading

**What it does**: Displays cards for each team showing league name, team name, and current score.

### `Lineups.jsx` - Lineup Viewer

**Purpose**: Shows starting lineups and bench players, grouped by position.

**Props**:
- `teams`: Array of user's teams
- `loading`: Boolean indicating if data is loading
- `onLoadUserData`: Function to reload user data

**What it does**:
- Displays players grouped by position (QB, RB, WR, TE, K, DEF)
- Shows both starting and bench players
- Groups players by league

### `Notifications.jsx` - League Notifications

**Purpose**: Displays league transactions and notifications.

**Props**:
- `notifications`: Array of notification objects
- `loading`: Boolean indicating if data is loading
- `currentWeek`: Current NFL week
- `notificationsWeek`: Which week's notifications are displayed
- `notificationsLoading`: Boolean for notification-specific loading
- `onLoadWeek`: Function to load notifications for a specific week

**What it does**:
- Shows transactions (trades, waivers, free agent pickups)
- Allows filtering by week
- Displays notification time and league name

### `Scoring.jsx` - Live Scoring

**Purpose**: Shows live scoring and matchup information.

**Props**:
- `teams`: Array of user's teams
- `allTeams`: Array of all teams (including opponents)
- `matchups`: Array of matchup data
- `currentWeek`: Current NFL week
- `loading`: Boolean indicating if data is loading
- `loadWeekData`: Function to load data for a specific week

**What it does**:
- Displays scores for each team
- Shows opponent information
- Allows viewing different weeks
- Expandable sections show position breakdowns

### `Updates.jsx` - Project Updates

**Purpose**: Displays "Planned Improvements" and "Open Bugs" sections from the README.

**What it does**: Fetches the README from GitHub and parses specific sections to display them in the app.

## Data Flow

### How Data Moves Through the App

1. **Initial Load**:
   ```
   App.jsx mounts
   → useEffect runs
   → Calls loadUserData('jselles216', currentYear)
   → useSleeperData hook executes
   → Calls SleeperApiService.getUser('jselles216')
   → API returns user data
   → Calls SleeperApiService.getUserLeagues(userId, season)
   → API returns leagues
   → For each league, fetches rosters, users, matchups, transactions
   → Processes data into internal format
   → Updates state (teams, matchups, notifications)
   → Components re-render with new data
   ```

2. **Changing Season**:
   ```
   User selects different season in dropdown
   → onSeasonChange handler fires
   → Calls loadUserData(username, newSeason)
   → useSleeperData fetches leagues for that season
   → Updates all data for the new season
   → Components re-render
   ```

3. **Changing Week**:
   ```
   User selects different week in Scoring tab
   → onChange handler fires
   → Calls loadWeekData(newWeek)
   → Checks if data is cached
   → If not cached, fetches matchups for that week
   → Updates matchups state
   → Scoring component re-renders with new week's data
   ```

### The `useSleeperData` Hook

This is the heart of the app's data management. Here's what it does:

**State it manages**:
- `teams`: User's teams across all leagues
- `allTeams`: All teams (including opponents) for matchup info
- `matchups`: Current week's matchup data
- `notifications`: League transactions/notifications
- `season`: Current season being viewed
- `currentWeek`: Current NFL week
- `loading`: Whether data is currently being fetched
- `error`: Any error that occurred

**Functions it provides**:
- `loadUserData(username, season)`: Fetches all data for a user and season
- `loadWeekData(week)`: Fetches matchup data for a specific week
- `loadNotificationsWeek(week)`: Fetches notifications for a specific week

**Why it's a custom hook**: Instead of putting all this logic in `App.jsx`, we extract it into a reusable hook. This makes the code cleaner and the logic reusable.

### The `SleeperApiService`

This service handles all communication with the Sleeper API.

**What it does**:
- Makes HTTP requests to Sleeper's API endpoints
- Handles errors
- Returns JavaScript objects (parsed from JSON)

**Key functions**:
- `getUser(username)`: Gets user info by username
- `getUserLeagues(userId, season)`: Gets all leagues for a user in a season
- `getLeague(leagueId)`: Gets league details
- `getLeagueRosters(leagueId)`: Gets all rosters in a league
- `getLeagueMatchups(leagueId, week)`: Gets matchups for a specific week
- `getLeagueTransactions(leagueId, week)`: Gets transactions for a specific week

## Features

### 🏈 Lineups
- View starting lineups and bench players
- Players grouped by position (QB, RB, WR, TE, K, DEF)
- Organized by league

### 🔔 Notifications
- League transactions (trades, waivers, free agent pickups)
- Week-by-week filtering
- Real-time updates

### 📈 Live Scoring
- Real-time scoring updates
- Week-by-week matchup viewing
- Expandable score breakdowns by position
- Opponent information

### 📅 Season & Week Navigation
- View data from previous seasons (2020-2024)
- Navigate between weeks within a season
- Automatic current week detection

### 🎨 Modern UI
- Responsive design (works on mobile and desktop)
- Expandable sections for detailed views
- Loading indicators
- Error handling

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes. You'll also see any lint errors in the console.

**What happens**: Starts a development server with hot-reloading (changes appear instantly without refreshing).

### `npm test`

Launches the test runner in interactive watch mode.

**What happens**: Runs unit tests using Jest and React Testing Library. Tests are in the `__tests__` folders.

### `npm run build`

Builds the app for production to the `build` folder.

**What happens**: 
- Optimizes the code for production
- Minifies JavaScript and CSS
- Creates a `build` folder with static files
- These files can be deployed to a web server

### `npm eject`

**⚠️ Warning**: This is a one-way operation. Once you `eject`, you can't go back!

**What it does**: Ejects from Create React App, giving you full control over the build configuration. You usually don't need to do this.

## Planned Improvements

- Migrate to a Node backend script to periodically fetch and refresh league data without relying on a manual "Connect to Sleeper" action.

### Open Bugs

- Player projections are currently always 0; investigate and correct projection sourcing.
- Scoring projections in general look wonky. Need to be updated.
- The `calculatePositionScores` function uses placeholder percentages instead of actual position breakdowns.

## Understanding the Code

### Why JSX?

JSX looks like HTML but is actually JavaScript. React transforms it into JavaScript function calls:

```jsx
// What you write (JSX):
<div className="container">
  <h1>Hello</h1>
</div>

// What React sees (JavaScript):
React.createElement('div', { className: 'container' },
  React.createElement('h1', null, 'Hello')
)
```

### Why Hooks?

Before hooks, React used class components which were more verbose. Hooks let you use React features in function components, which are simpler:

```jsx
// Old way (class component):
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  render() {
    return <div>{this.state.count}</div>;
  }
}

// New way (function component with hooks):
function MyComponent() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}
```

### Why Custom Hooks?

Custom hooks let you share logic between components:

```jsx
// Without custom hook (logic duplicated):
function ComponentA() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(setData);
  }, []);
  // ...
}

function ComponentB() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(setData);
  }, []);
  // ...
}

// With custom hook (logic shared):
function useApiData() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(setData);
  }, []);
  return data;
}

function ComponentA() {
  const data = useApiData();
  // ...
}

function ComponentB() {
  const data = useApiData();
  // ...
}
```

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

## Additional Learning Resources

If you're learning React, here are some helpful resources:

- [React Official Documentation](https://react.dev/)
- [React Hooks Documentation](https://react.dev/reference/react)
- [React Router Documentation](https://reactrouter.com/)
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
