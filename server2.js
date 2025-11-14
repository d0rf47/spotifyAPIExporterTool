const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const open = require('open');
const fs = require('fs').promises;
const readline = require('readline');
const crypto = require('crypto');

// ============================================
// CONFIGURATION
// ============================================
// This is YOUR Client ID (public - safe to embed)
// Get this from: https://developer.spotify.com/dashboard
const SPOTIFY_CLIENT_ID = 'e174079272c149288253cceaaee0a069';
const REDIRECT_URI = 'http://127.0.0.1:8888/callback';
const PORT = 8888;

// Spotify API Configuration (PKCE - no secret needed!)
const spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  redirectUri: REDIRECT_URI
});

const app = express();

// Scopes needed to access user's liked songs
const scopes = ['user-library-read'];

// PKCE variables
let codeVerifier = '';
let codeChallenge = '';

// Store fetched songs globally for web UI
let fetchedSongs = [];
let server = null;

// ============================================
// PKCE HELPER FUNCTIONS
// ============================================

// Generate random string for code verifier
function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.randomBytes(length);
  return Array.from(values)
    .map((x) => possible[x % possible.length])
    .join('');
}

// Generate code challenge from verifier
function generateCodeChallenge(verifier) {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('     Spotify Liked Songs Exporter - Web UI');
  console.log('     PKCE Version - No User Credentials Needed!');
  console.log('═══════════════════════════════════════════════════\n');

  // Check if Client ID is configured
  if (SPOTIFY_CLIENT_ID === 'YOUR_CLIENT_ID_HERE') {
    console.error('❌ Error: Spotify Client ID not configured!');
    console.log('\nPlease update the SPOTIFY_CLIENT_ID in server2.js');
    console.log('Get your Client ID at: https://developer.spotify.com/dashboard\n');
    console.log('Instructions:');
    console.log('1. Create an app in Spotify Dashboard');
    console.log('2. Add redirect URI: http://127.0.0.1:8888/callback');
    console.log('3. Copy the Client ID and paste it in server2.js (line 13)');
    console.log('4. NO CLIENT SECRET NEEDED (PKCE flow)\n');
    process.exit(1);
  }

  try {
    // Setup web routes before starting authentication
    setupWebRoutes();
    
    // Start server
    server = app.listen(PORT, () => {
      console.log(`🌐 Server running on http://127.0.0.1:${PORT}`);
      console.log('🔐 Opening browser for authentication...\n');
    });
    
    // Start authentication flow
    await authenticate();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// ============================================
// WEB ROUTES
// ============================================

function setupWebRoutes() {
  // Loading page with auto-redirect
  app.get('/loading', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>Loading Songs...</title>
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              background: linear-gradient(135deg, #1DB954 0%, #191414 100%);
              margin: 0;
              padding: 50px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .container {
              background: white;
              padding: 60px;
              border-radius: 15px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 500px;
            }
            .spinner {
              border: 4px solid #f3f3f3;
              border-top: 4px solid #1DB954;
              border-radius: 50%;
              width: 60px;
              height: 60px;
              animation: spin 1s linear infinite;
              margin: 30px auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            h1 { color: #1DB954; margin: 0 0 20px 0; }
            p { color: #666; font-size: 16px; }
          </style>
          <script>
            // Check every 2 seconds if songs are loaded
            setInterval(async () => {
              try {
                const response = await fetch('/api/songs/status');
                const data = await response.json();
                if (data.loaded) {
                  window.location.href = '/results';
                }
              } catch (e) {
                console.error('Error checking status:', e);
              }
            }, 2000);
          </script>
        </head>
        <body>
          <div class="container">
            <h1>🎵 Loading Your Liked Songs</h1>
            <div class="spinner"></div>
            <p>Fetching all your liked songs from Spotify...</p>
            <p style="color: #999; font-size: 14px;">This may take a moment for large libraries</p>
          </div>
        </body>
      </html>
    `);
  });

  // API endpoint to check if songs are loaded
  app.get('/api/songs/status', (req, res) => {
    res.json({ loaded: fetchedSongs.length > 0, count: fetchedSongs.length });
  });

  // Results page with HTML table
  app.get('/results', (req, res) => {
    if (fetchedSongs.length === 0) {
      res.redirect('/loading');
      return;
    }

    // Generate table rows
    const tableRows = fetchedSongs.map((item, index) => {
      const track = item.track;
      const artists = track.artists.map(artist => artist.name).join(', ');
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(track.name)}</td>
          <td>${escapeHtml(artists)}</td>
        </tr>
      `;
    }).join('');

    res.send(`
      <html>
        <head>
          <title>Your Spotify Liked Songs</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              background: linear-gradient(135deg, #1DB954 0%, #191414 100%);
              padding: 40px 20px;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 15px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.3);
              max-width: 1200px;
              margin: 0 auto;
            }
            h1 {
              color: #1DB954;
              margin-bottom: 10px;
              font-size: 32px;
            }
            .subtitle {
              color: #666;
              margin-bottom: 30px;
              font-size: 18px;
            }
            .download-section {
              display: flex;
              gap: 15px;
              margin-bottom: 30px;
              flex-wrap: wrap;
            }
            .download-btn {
              background: #1DB954;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 25px;
              font-size: 16px;
              font-weight: bold;
              cursor: pointer;
              text-decoration: none;
              display: inline-block;
              transition: all 0.3s ease;
            }
            .download-btn:hover {
              background: #1ed760;
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(29, 185, 84, 0.4);
            }
            .table-container {
              overflow-x: auto;
              border-radius: 10px;
              border: 1px solid #ddd;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            thead {
              background: #1DB954;
              color: white;
              position: sticky;
              top: 0;
            }
            th {
              padding: 15px;
              text-align: left;
              font-weight: bold;
              font-size: 16px;
            }
            th:first-child {
              width: 60px;
              text-align: center;
            }
            td {
              padding: 12px 15px;
              border-bottom: 1px solid #f0f0f0;
            }
            td:first-child {
              text-align: center;
              color: #999;
              font-weight: 500;
            }
            tr:hover {
              background: #f9f9f9;
            }
            tr:last-child td {
              border-bottom: none;
            }
            .stats {
              background: #f0f0f0;
              padding: 15px 20px;
              border-radius: 10px;
              margin-bottom: 20px;
              display: inline-block;
            }
            .stats strong {
              color: #1DB954;
              font-size: 24px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎵 Your Spotify Liked Songs</h1>
            <div class="stats">
              Total Songs: <strong>${fetchedSongs.length}</strong>
            </div>
            <p class="subtitle">Exported on ${new Date().toLocaleString()}</p>
            
            <div class="download-section">
              <a href="/download/txt" class="download-btn" download>📄 Download TXT</a>
              <a href="/download/csv" class="download-btn" download>📊 Download CSV</a>
              <a href="/download/detailed" class="download-btn" download>📋 Download Detailed</a>
              <a href="/download/uris" class="download-btn" download>🔗 Download URIs</a>
            </div>
            
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Track Name</th>
                    <th>Artist(s)</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>
            </div>
          </div>
        </body>
      </html>
    `);
  });

  // Download endpoints
  app.get('/download/txt', async (req, res) => {
    if (fetchedSongs.length === 0) {
      res.status(400).send('No songs available');
      return;
    }

    const content = await createSimpleFormatContent(fetchedSongs);
    const filename = `spotify_liked_songs_${new Date().toISOString().slice(0,10)}.txt`;
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  });

  app.get('/download/csv', async (req, res) => {
    if (fetchedSongs.length === 0) {
      res.status(400).send('No songs available');
      return;
    }

    const content = await createCSVFormatContent(fetchedSongs);
    const filename = `spotify_liked_songs_${new Date().toISOString().slice(0,10)}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  });

  app.get('/download/detailed', async (req, res) => {
    if (fetchedSongs.length === 0) {
      res.status(400).send('No songs available');
      return;
    }

    const content = await createDetailedFormatContent(fetchedSongs);
    const filename = `spotify_liked_songs_detailed_${new Date().toISOString().slice(0,10)}.txt`;
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  });

  app.get('/download/uris', async (req, res) => {
    if (fetchedSongs.length === 0) {
      res.status(400).send('No songs available');
      return;
    }

    const content = await createURIFormatContent(fetchedSongs);
    const filename = `spotify_liked_songs_uris_${new Date().toISOString().slice(0,10)}.txt`;
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  });
}

// Helper function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ============================================
// AUTHENTICATION (PKCE FLOW)
// ============================================

async function authenticate() {
  return new Promise((resolve, reject) => {
    // Generate PKCE code verifier and challenge
    codeVerifier = generateRandomString(64);
    codeChallenge = generateCodeChallenge(codeVerifier);
    
    console.log('🔐 Starting authentication process (PKCE)...');
    
    // Create authorization URL with PKCE parameters manually
    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: scopes.join(' '),
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      state: 'state'
    });
    const authorizeURL = `https://accounts.spotify.com/authorize?${params.toString()}`;
    
    // Open browser for authentication
    open(authorizeURL);
    
    // Setup callback endpoint
    app.get('/callback', async (req, res) => {
      const code = req.query.code;
      const error = req.query.error;
      
      if (error) {
        res.send(`
          <html>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1 style="color: #ff0000;">❌ Authentication Failed!</h1>
              <p>Error: ${error}</p>
              <p>You can close this window and try again.</p>
            </body>
          </html>
        `);
        reject(new Error(`Authentication error: ${error}`));
        setTimeout(() => server.close(), 1000);
        return;
      }
      
      if (!code) {
        res.send('❌ Authentication failed! No authorization code received. You can close this window.');
        reject(new Error('No authorization code received'));
        setTimeout(() => server.close(), 1000);
        return;
      }
      
      try {
        // Exchange authorization code for access token using PKCE
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: SPOTIFY_CLIENT_ID,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            code_verifier: codeVerifier
          })
        });
        
        const data = await tokenResponse.json();
        
        if (!tokenResponse.ok) {
          throw new Error(data.error_description || 'Failed to get access token');
        }
        
        spotifyApi.setAccessToken(data.access_token);
        spotifyApi.setRefreshToken(data.refresh_token);
        
        res.send(`
          <html>
            <head>
              <meta http-equiv="refresh" content="2;url=/loading">
            </head>
            <body style="font-family: Arial; text-align: center; padding: 50px; background: linear-gradient(135deg, #1DB954 0%, #191414 100%);">
              <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto;">
                <h1 style="color: #1DB954; margin: 0 0 20px 0;">✓ Authentication Successful!</h1>
                <p style="color: #333; font-size: 18px;">You're all set!</p>
                <div style="margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 5px;">
                  <p style="margin: 0; color: #1DB954; font-weight: bold;">🎵 Fetching your liked songs...</p>
                </div>
              </div>
            </body>
          </html>
        `);
        
        console.log('✓ Authentication successful!');
        console.log('📥 Fetching your liked songs...');
        
        // Fetch songs in background and then user will be redirected to results
        fetchAllLikedSongs().then(songs => {
          fetchedSongs = songs;
          console.log(`✓ Found ${songs.length} liked songs!`);
          console.log('🌐 View results at: http://127.0.0.1:8888/results');
        }).catch(err => {
          console.error('Error fetching songs:', err.message);
        });
        
        resolve();
        
      } catch (error) {
        res.send(`
          <html>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1 style="color: #ff0000;">❌ Authentication Failed!</h1>
              <p>Error: ${error.message}</p>
              <p>You can close this window and try again.</p>
            </body>
          </html>
        `);
        reject(error);
      }
    });
  });
}

// ============================================
// FETCH LIKED SONGS
// ============================================

async function fetchAllLikedSongs() {
  const allTracks = [];
  let offset = 0;
  const limit = 50; // Max limit per request
  
  try {
    while (true) {
      const data = await spotifyApi.getMySavedTracks({
        limit: limit,
        offset: offset
      });
      
      const tracks = data.body.items;
      allTracks.push(...tracks);
      
      // Progress indicator
      process.stdout.write(`\r📊 Fetched ${allTracks.length} songs...`);
      
      // Check if there are more tracks
      if (tracks.length < limit) {
        break;
      }
      
      offset += limit;
      
      // Small delay to avoid rate limiting (optional but polite)
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return allTracks;
    
  } catch (error) {
    throw new Error(`Failed to fetch liked songs: ${error.message}`);
  }
}

// ============================================
// CONTENT GENERATION FOR WEB DOWNLOADS
// ============================================

async function createSimpleFormatContent(songs) {
  let content = '═══════════════════════════════════════════════════\n';
  content += '          MY SPOTIFY LIKED SONGS\n';
  content += `          Total: ${songs.length} songs\n`;
  content += `          Exported: ${new Date().toLocaleString()}\n`;
  content += '═══════════════════════════════════════════════════\n\n';
  
  songs.forEach((item, index) => {
    const track = item.track;
    const artists = track.artists.map(artist => artist.name).join(', ');
    content += `${index + 1}. ${track.name} - ${artists}\n`;
  });
  
  return content;
}

async function createDetailedFormatContent(songs) {
  let content = '═══════════════════════════════════════════════════\n';
  content += '          MY SPOTIFY LIKED SONGS (DETAILED)\n';
  content += `          Total: ${songs.length} songs\n`;
  content += `          Exported: ${new Date().toLocaleString()}\n`;
  content += '═══════════════════════════════════════════════════\n\n';
  
  songs.forEach((item, index) => {
    const track = item.track;
    const artists = track.artists.map(artist => artist.name).join(', ');
    const duration = formatDuration(track.duration_ms);
    const addedDate = new Date(item.added_at).toLocaleDateString();
    
    content += `${index + 1}.\n`;
    content += `   Track: ${track.name}\n`;
    content += `   Artist(s): ${artists}\n`;
    content += `   Album: ${track.album.name}\n`;
    content += `   Release Date: ${track.album.release_date}\n`;
    content += `   Duration: ${duration}\n`;
    content += `   Added: ${addedDate}\n`;
    content += `   Popularity: ${track.popularity}/100\n`;
    content += `   Spotify URL: ${track.external_urls.spotify}\n\n`;
  });
  
  return content;
}

async function createURIFormatContent(songs) {
  let content = '# Spotify Track URIs - Use for playlist import\n';
  content += `# Total: ${songs.length} songs\n`;
  content += `# Exported: ${new Date().toLocaleString()}\n\n`;
  
  songs.forEach((item) => {
    content += `${item.track.uri}\n`;
  });
  
  return content;
}

async function createCSVFormatContent(songs) {
  // CSV Header
  let content = 'Track Name,Artist(s),Album,Release Date,Duration,Added Date,Popularity,Spotify URL,Track URI\n';
  
  songs.forEach((item) => {
    const track = item.track;
    const artists = track.artists.map(artist => artist.name).join('; ');
    const duration = formatDuration(track.duration_ms);
    const addedDate = new Date(item.added_at).toLocaleDateString();
    
    // Escape fields that might contain commas
    const trackName = `"${track.name.replace(/"/g, '""')}"`;
    const artistsEscaped = `"${artists.replace(/"/g, '""')}"`;
    const albumName = `"${track.album.name.replace(/"/g, '""')}"`;
    
    content += `${trackName},${artistsEscaped},${albumName},${track.album.release_date},${duration},${addedDate},${track.popularity},${track.external_urls.spotify},${track.uri}\n`;
  });
  
  return content;
}

// Helper function to format duration
function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ============================================
// USER INTERACTION
// ============================================

async function askExportFormat() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    console.log('\n📝 Choose export format:');
    console.log('1. Simple (Track - Artist)');
    console.log('2. Detailed (Track, Artist, Album, Release Date, Duration)');
    console.log('3. Spotify URI (for playlist import)');
    console.log('4. CSV Format (spreadsheet compatible)');
    console.log('5. All formats (creates multiple files)\n');
    
    rl.question('Enter choice (1-5) [default: 1]: ', (answer) => {
      rl.close();
      const choice = answer.trim() || '1';
      resolve(choice);
    });
  });
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

async function exportToFile(songs, format) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  
  try {
    if (format === '5') {
      // Export all formats
      await createSimpleFormat(songs, timestamp);
      await createDetailedFormat(songs, timestamp);
      await createURIFormat(songs, timestamp);
      await createCSVFormat(songs, timestamp);
    } else if (format === '1') {
      await createSimpleFormat(songs, timestamp);
    } else if (format === '2') {
      await createDetailedFormat(songs, timestamp);
    } else if (format === '3') {
      await createURIFormat(songs, timestamp);
    } else if (format === '4') {
      await createCSVFormat(songs, timestamp);
    } else {
      await createSimpleFormat(songs, timestamp);
    }
    
  } catch (error) {
    throw new Error(`Failed to export: ${error.message}`);
  }
}

// Format 1: Simple format
async function createSimpleFormat(songs, timestamp) {
  const filename = `spotify_liked_songs_simple_${timestamp}.txt`;
  let content = '═══════════════════════════════════════════════════\n';
  content += '          MY SPOTIFY LIKED SONGS\n';
  content += `          Total: ${songs.length} songs\n`;
  content += `          Exported: ${new Date().toLocaleString()}\n`;
  content += '═══════════════════════════════════════════════════\n\n';
  
  songs.forEach((item, index) => {
    const track = item.track;
    const artists = track.artists.map(artist => artist.name).join(', ');
    content += `${index + 1}. ${track.name} - ${artists}\n`;
  });
  
  await fs.writeFile(filename, content, 'utf8');
  console.log(`\n✓ Created: ${filename}`);
}

// Format 2: Detailed format
async function createDetailedFormat(songs, timestamp) {
  const filename = `spotify_liked_songs_detailed_${timestamp}.txt`;
  let content = '═══════════════════════════════════════════════════\n';
  content += '          MY SPOTIFY LIKED SONGS (DETAILED)\n';
  content += `          Total: ${songs.length} songs\n`;
  content += `          Exported: ${new Date().toLocaleString()}\n`;
  content += '═══════════════════════════════════════════════════\n\n';
  
  songs.forEach((item, index) => {
    const track = item.track;
    const artists = track.artists.map(artist => artist.name).join(', ');
    const duration = formatDuration(track.duration_ms);
    const addedDate = new Date(item.added_at).toLocaleDateString();
    
    content += `${index + 1}.\n`;
    content += `   Track: ${track.name}\n`;
    content += `   Artist(s): ${artists}\n`;
    content += `   Album: ${track.album.name}\n`;
    content += `   Release Date: ${track.album.release_date}\n`;
    content += `   Duration: ${duration}\n`;
    content += `   Added: ${addedDate}\n`;
    content += `   Popularity: ${track.popularity}/100\n`;
    content += `   Spotify URL: ${track.external_urls.spotify}\n\n`;
  });
  
  await fs.writeFile(filename, content, 'utf8');
  console.log(`✓ Created: ${filename}`);
}

// Format 3: Spotify URI format
async function createURIFormat(songs, timestamp) {
  const filename = `spotify_liked_songs_uris_${timestamp}.txt`;
  let content = '# Spotify Track URIs - Use for playlist import\n';
  content += `# Total: ${songs.length} songs\n`;
  content += `# Exported: ${new Date().toLocaleString()}\n\n`;
  
  songs.forEach((item) => {
    content += `${item.track.uri}\n`;
  });
  
  await fs.writeFile(filename, content, 'utf8');
  console.log(`✓ Created: ${filename}`);
}

// Format 4: CSV format
async function createCSVFormat(songs, timestamp) {
  const filename = `spotify_liked_songs_${timestamp}.csv`;
  
  // CSV Header
  let content = 'Track Name,Artist(s),Album,Release Date,Duration,Added Date,Popularity,Spotify URL,Track URI\n';
  
  songs.forEach((item) => {
    const track = item.track;
    const artists = track.artists.map(artist => artist.name).join('; ');
    const duration = formatDuration(track.duration_ms);
    const addedDate = new Date(item.added_at).toLocaleDateString();
    
    // Escape fields that might contain commas
    const trackName = `"${track.name.replace(/"/g, '""')}"`;
    const artistsEscaped = `"${artists.replace(/"/g, '""')}"`;
    const albumName = `"${track.album.name.replace(/"/g, '""')}"`;
    
    content += `${trackName},${artistsEscaped},${albumName},${track.album.release_date},${duration},${addedDate},${track.popularity},${track.external_urls.spotify},${track.uri}\n`;
  });
  
  await fs.writeFile(filename, content, 'utf8');
  console.log(`✓ Created: ${filename}`);
}

// ============================================
// START THE APPLICATION
// ============================================

main();

