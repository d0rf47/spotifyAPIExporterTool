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
  res.render('loading', {
    pageTitle: 'Loading Songs...',
    bodyClass: 'centered',
    containerClass: 'loading-container',
    extraHead: '<script src="/js/loading.js" defer></script>'
  });
});

// API endpoint to check if songs are loaded
router.get('/api/songs/status', (req, res) => {
  res.json({ 
    loaded: fetchedSongs.length > 0, 
    count: fetchedSongs.length 
  });
});

// Results page route with sorting
router.get('/results', (req, res) => {
  if (fetchedSongs.length === 0) {
    res.redirect('/loading');
    return;
  }

  // Get sort parameters from query string
  const sortBy = req.query.sortBy || 'index'; // default: original order
  const sortOrder = req.query.sortOrder || 'asc'; // default: ascending
  
  // Create a copy of songs to sort (don't mutate original)
  let sortedSongs = [...fetchedSongs];
  
  // Sort the songs based on the selected column
  if (sortBy !== 'index') {
    sortedSongs.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'track':
          valueA = a.track.name.toLowerCase();
          valueB = b.track.name.toLowerCase();
          break;
        case 'album':
          valueA = a.track.album.name.toLowerCase();
          valueB = b.track.album.name.toLowerCase();
          break;
        case 'artist':
          valueA = a.track.artists[0].name.toLowerCase();
          valueB = b.track.artists[0].name.toLowerCase();
          break;
        default:
          return 0;
      }
      
      // Compare values
      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  res.render('results', { 
    songs: sortedSongs,
    exportDate: new Date().toLocaleString(),
    pageTitle: 'Your Spotify Liked Songs',
    bodyClass: 'results-page',
    containerClass: 'results-container',
    currentSort: { by: sortBy, order: sortOrder },
    cached: false, // Explicitly mark as fresh data
    extraScript: '<script src="/js/cache-manager.js"></script><script src="/js/save-to-cache.js"></script>'
  });
});

// Cached results page route - displays songs from client-side localStorage
router.get('/cached-results', (req, res) => {
  // Render the unified results template with cached flag set to true
  res.render('results', {
    pageTitle: 'Your Cached Spotify Songs',
    bodyClass: 'results-page',
    containerClass: 'results-container',
    cached: true, // Flag to indicate this is cached data view
    extraScript: '<script src="/js/cache-manager.js"></script><script src="/js/load-cached.js"></script>'
  });
});

module.exports = { 
  router, 
  setFetchedSongs, 
  getFetchedSongs,
  clearFetchedSongs
};
