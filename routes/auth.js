// ============================================
// AUTHENTICATION ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const open = require('open');
const { generatePKCEPair } = require('../utils/pkce');
const { 
  createAuthorizationURL, 
  exchangeCodeForToken,
  fetchAllLikedSongs 
} = require('../utils/spotify');
const config = require('../config/config');

// PKCE state
let pkceData = null;

/**
 * Setup authentication routes
 * @param {SpotifyWebApi} spotifyApi - Spotify API instance
 * @param {Function} onSongsFetched - Callback when songs are fetched
 * @param {Function} clearSongs - Callback to clear existing songs
 */
function setupAuthRoutes(spotifyApi, onSongsFetched, clearSongs) {
  // Callback route
  router.get('/callback', async (req, res) => {
    const code = req.query.code;
    const error = req.query.error;
    
    // Handle error
    if (error) {
      res.render('error', { 
        errorMessage: error,
        pageTitle: 'Authentication Failed',
        bodyClass: 'centered',
        containerClass: 'error-container'
      });
      return;
    }
    
    // Handle missing code
    if (!code) {
      res.render('error', { 
        errorMessage: 'No authorization code received',
        pageTitle: 'Authentication Failed',
        bodyClass: 'centered',
        containerClass: 'error-container'
      });
      return;
    }
    
    try {
      // Exchange code for token using PKCE
      const tokenData = await exchangeCodeForToken(
        code,
        pkceData.verifier,
        config.spotify.clientId,
        config.spotify.redirectUri
      );
      
      // Set tokens in Spotify API
      spotifyApi.setAccessToken(tokenData.access_token);
      spotifyApi.setRefreshToken(tokenData.refresh_token);
      
      // Send success page with button
      res.render('success', {
        pageTitle: 'Authentication Successful',
        bodyClass: 'centered',
        containerClass: 'success-container',
        flexWrapper: true,
        extraScript: `
          <script>
            function startFetch() {
              const btn = document.querySelector('.start-btn');
              btn.disabled = true;
              btn.textContent = 'Starting...';
              window.location.href = '/start-fetch';
            }
          </script>
        `
      });
      
      console.log('✓ Authentication successful!');
      console.log('⏳ Waiting for user to start export...');
      
    } catch (error) {
      res.render('error', { 
        errorMessage: error.message,
        pageTitle: 'Authentication Failed',
        bodyClass: 'centered',
        containerClass: 'error-container'
      });
    }
  });

  // Start fetch route - triggered when user clicks "Start Export"
  router.get('/start-fetch', async (req, res) => {
    console.log('📥 User initiated song fetch...');
    
    // Clear any existing songs
    clearSongs();
    
    // Redirect to loading page immediately
    res.redirect('/loading');
    
    // Fetch songs in background
    fetchAllLikedSongs(spotifyApi)
      .then(songs => {
        onSongsFetched(songs);
        console.log(`✓ Found ${songs.length} liked songs!`);
        console.log('🌐 View results at: http://127.0.0.1:8888/results');
      })
      .catch(err => {
        console.error('Error fetching songs:', err.message);
      });
  });

  return router;
}

/**
 * Start authentication flow
 */
function startAuthentication() {
  // Generate PKCE pair
  pkceData = generatePKCEPair();
  
  // Create authorization URL
  const authUrl = createAuthorizationURL(
    config.spotify.clientId,
    config.spotify.redirectUri,
    config.spotify.scopes,
    pkceData.challenge
  );
  
  console.log('🔐 Starting authentication process (PKCE)...');
  
  // Open browser
  open(authUrl);
}

module.exports = { 
  setupAuthRoutes, 
  startAuthentication 
};
