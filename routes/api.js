// ============================================
// API ROUTES
// ============================================

const express = require('express');
const router = express.Router();

// Store fetched songs (shared with main app)
let fetchedSongs = [];

/**
 * Set the fetched songs
 * @param {Array} songs - Array of songs
 */
function setFetchedSongs(songs) {
  fetchedSongs = songs;
}

/**
 * Get the fetched songs
 * @returns {Array} Array of songs
 */
function getFetchedSongs() {
  return fetchedSongs;
}

/**
 * Clear the fetched songs (for starting a new fetch)
 */
function clearFetchedSongs() {
  fetchedSongs = [];
}

// Loading page route
router.get('/loading', (req, res) => {
  res.render('loading');
});

// API endpoint to check if songs are loaded
router.get('/api/songs/status', (req, res) => {
  res.json({ 
    loaded: fetchedSongs.length > 0, 
    count: fetchedSongs.length 
  });
});

// Results page route
router.get('/results', (req, res) => {
  if (fetchedSongs.length === 0) {
    res.redirect('/loading');
    return;
  }

  res.render('results', { 
    songs: fetchedSongs,
    exportDate: new Date().toLocaleString()
  });
});

module.exports = { 
  router, 
  setFetchedSongs, 
  getFetchedSongs,
  clearFetchedSongs
};
