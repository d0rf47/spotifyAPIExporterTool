// ============================================
// SPOTIFY LIKED SONGS EXPORTER - WEB UI
// ============================================
// Organized structure with EJS templates

const express = require('express');
const path = require('path');
const SpotifyWebApi = require('spotify-web-api-node');
const config = require('./config/config');
const { setupAuthRoutes, startAuthentication } = require('./routes/auth');
const { router: apiRouter, setFetchedSongs, getFetchedSongs, clearFetchedSongs } = require('./routes/api');
const { setupDownloadRoutes } = require('./routes/downloads');

// Initialize Express app
const app = express();

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Configure EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Initialize Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: config.spotify.clientId,
  redirectUri: config.spotify.redirectUri
});

// ============================================
// SETUP ROUTES
// ============================================

// Authentication routes
const authRouter = setupAuthRoutes(
  spotifyApi, 
  (songs) => setFetchedSongs(songs),
  clearFetchedSongs
);
app.use('/', authRouter);

// API routes (loading, results, status)
app.use('/', apiRouter);

// Download routes
const downloadRouter = setupDownloadRoutes(getFetchedSongs);
app.use('/', downloadRouter);

// ============================================
// START APPLICATION
// ============================================

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('     Spotify Liked Songs Exporter - Web UI');
  console.log('     PKCE Version - No User Credentials Needed!');
  console.log('     Using EJS Templates');
  console.log('═══════════════════════════════════════════════════\n');

  // Check if Client ID is configured
  if (config.spotify.clientId === 'YOUR_CLIENT_ID_HERE') {
    console.error('❌ Error: Spotify Client ID not configured!');
    console.log('\nPlease update the SPOTIFY_CLIENT_ID in config/config.js');
    console.log('Get your Client ID at: https://developer.spotify.com/dashboard\n');
    console.log('Instructions:');
    console.log('1. Create an app in Spotify Dashboard');
    console.log('2. Add redirect URI: http://127.0.0.1:8888/callback');
    console.log('3. Copy the Client ID and update config/config.js');
    console.log('4. NO CLIENT SECRET NEEDED (PKCE flow)\n');
    process.exit(1);
  }

  try {
    // Start server
    const server = app.listen(config.server.port, () => {
      console.log(`🌐 Server running on http://${config.server.host}:${config.server.port}`);
      console.log('🔐 Opening browser for authentication...\n');
    });
    
    // Start authentication flow
    startAuthentication();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Start the application
main();

