// ============================================
// SPOTIFY API UTILITIES
// ============================================

const config = require('../config/config');
const allTracks = [];
/**
 * Fetch all liked songs from Spotify with pagination
 * @param {SpotifyWebApi} spotifyApi - Initialized Spotify API instance
 * @returns {Promise<Array>} Array of all liked tracks
 */
async function fetchAllLikedSongs(spotifyApi) {
  
  let offset = 0;
  const limit = config.fetch.limit;
  
  if(allTracks.length === 0 ) {
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
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, config.fetch.delayMs));
      }
    
    return allTracks;
    
  } catch (error) {
    throw new Error(`Failed to fetch liked songs: ${error.message}`);
  }
  }else {
    return allTracks;
  }
  
}

/**
 * Exchange authorization code for access token using PKCE
 * @param {string} code - Authorization code
 * @param {string} codeVerifier - PKCE code verifier
 * @param {string} clientId - Spotify client ID
 * @param {string} redirectUri - Redirect URI
 * @returns {Promise<object>} Token response
 */
async function exchangeCodeForToken(code, codeVerifier, clientId, redirectUri) {
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    })
  });
  
  const data = await tokenResponse.json();
  
  if (!tokenResponse.ok) {
    throw new Error(data.error_description || 'Failed to get access token');
  }
  
  return data;
}

/**
 * Create Spotify authorization URL with PKCE
 * @param {string} clientId - Spotify client ID
 * @param {string} redirectUri - Redirect URI
 * @param {Array<string>} scopes - Authorization scopes
 * @param {string} codeChallenge - PKCE code challenge
 * @returns {string} Authorization URL
 */
function createAuthorizationURL(clientId, redirectUri, scopes, codeChallenge) {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    state: 'state'
  });
  
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

module.exports = {
  fetchAllLikedSongs,
  exchangeCodeForToken,
  createAuthorizationURL
};

