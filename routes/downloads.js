// ============================================
// DOWNLOAD ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const {
  createSimpleFormat,
  createCSVFormat,
  createDetailedFormat,
  createURIFormat
} = require('../utils/formatters');

/**
 * Setup download routes
 * @param {Function} getSongsFunction - Function to get fetched songs
 */
function setupDownloadRoutes(getSongsFunction) {
  // Download TXT (Simple format)
  router.get('/download/txt', async (req, res) => {
    const songs = getSongsFunction();
    
    if (songs.length === 0) {
      res.status(400).send('No songs available');
      return;
    }

    const content = createSimpleFormat(songs);
    const filename = `spotify_liked_songs_${new Date().toISOString().slice(0,10)}.txt`;
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  });

  // Download CSV
  router.get('/download/csv', async (req, res) => {
    const songs = getSongsFunction();
    
    if (songs.length === 0) {
      res.status(400).send('No songs available');
      return;
    }

    const content = createCSVFormat(songs);
    const filename = `spotify_liked_songs_${new Date().toISOString().slice(0,10)}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  });

  // Download Detailed
  router.get('/download/detailed', async (req, res) => {
    const songs = getSongsFunction();
    
    if (songs.length === 0) {
      res.status(400).send('No songs available');
      return;
    }

    const content = createDetailedFormat(songs);
    const filename = `spotify_liked_songs_detailed_${new Date().toISOString().slice(0,10)}.txt`;
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  });

  // Download URIs
  router.get('/download/uris', async (req, res) => {
    const songs = getSongsFunction();
    
    if (songs.length === 0) {
      res.status(400).send('No songs available');
      return;
    }

    const content = createURIFormat(songs);
    const filename = `spotify_liked_songs_uris_${new Date().toISOString().slice(0,10)}.txt`;
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  });

  return router;
}

module.exports = { setupDownloadRoutes };

