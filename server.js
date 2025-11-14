require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const open = require('open');
const fs = require('fs').promises;
const readline = require('readline');

// Spotify API Configuration
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'http://127.0.0.1:8888/callback'
});

const app = express();
const PORT = 8888;

// Scopes needed to access user's liked songs
const scopes = ['user-library-read'];

// Store the authorization code
let authorizationCode = null;

// Main function
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('     Spotify Liked Songs Exporter CLI Tool');
  console.log('═══════════════════════════════════════════════════\n');

  // Check if credentials are set
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.error('❌ Error: Spotify credentials not found!');
    console.log('\nPlease create a .env file with:');
    console.log('SPOTIFY_CLIENT_ID=your_client_id');
    console.log('SPOTIFY_CLIENT_SECRET=your_client_secret\n');
    console.log('Get your credentials at: https://developer.spotify.com/dashboard');
    process.exit(1);
  }

  try {
    // Start authentication flow
    await authenticate();
    
    // Fetch all liked songs
    console.log('\n📥 Fetching your liked songs...');
    const likedSongs = await fetchAllLikedSongs();
    
    console.log(`\n✓ Found ${likedSongs.length} liked songs!`);
    
    // Ask user for export format
    const format = await askExportFormat();
    
    // Export to file
    await exportToFile(likedSongs, format);
    
    console.log('\n✅ Export completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Authentication function
async function authenticate() {
  return new Promise((resolve, reject) => {
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'state');
    
    console.log('🔐 Starting authentication process...');
    console.log('Opening browser for Spotify login...\n');
    
    // Setup callback endpoint
    app.get('/callback', async (req, res) => {
      const code = req.query.code;
      
      if (!code) {
        res.send('❌ Authentication failed! You can close this window.');
        reject(new Error('No authorization code received'));
        return;
      }
      
      try {
        // Exchange authorization code for access token
        const data = await spotifyApi.authorizationCodeGrant(code);
        
        spotifyApi.setAccessToken(data.body['access_token']);
        spotifyApi.setRefreshToken(data.body['refresh_token']);
        
        res.send(`
          <html>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1 style="color: #1DB954;">✓ Authentication Successful!</h1>
              <p>You can close this window and return to the terminal.</p>
            </body>
          </html>
        `);
        
        console.log('✓ Authentication successful!');
        
        // Close the server after successful auth
        setTimeout(() => {
          server.close();
          resolve();
        }, 1000);
        
      } catch (error) {
        res.send('❌ Authentication failed! You can close this window.');
        reject(error);
      }
    });
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🌐 Local server running on http://localhost:${PORT}`);
      // Open browser for authentication
      open(authorizeURL);
    });
    
    // Timeout after 2 minutes
    setTimeout(() => {
      reject(new Error('Authentication timeout'));
    }, 120000);
  });
}

// Fetch all liked songs with pagination
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
    }
    
    return allTracks;
    
  } catch (error) {
    throw new Error(`Failed to fetch liked songs: ${error.message}`);
  }
}

// Ask user for export format preference
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
    console.log('4. All formats (creates 3 files)\n');
    
    rl.question('Enter choice (1-4) [default: 1]: ', (answer) => {
      rl.close();
      const choice = answer.trim() || '1';
      resolve(choice);
    });
  });
}

// Export songs to file
async function exportToFile(songs, format) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  
  try {
    if (format === '4') {
      // Export all formats
      await createSimpleFormat(songs, timestamp);
      await createDetailedFormat(songs, timestamp);
      await createURIFormat(songs, timestamp);
    } else if (format === '1') {
      await createSimpleFormat(songs, timestamp);
    } else if (format === '2') {
      await createDetailedFormat(songs, timestamp);
    } else if (format === '3') {
      await createURIFormat(songs, timestamp);
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
    content += `${index + 1}. ${track.name} - ${artists} ${track.album.name}\n`;
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

// Helper function to format duration
function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Start the application
main();