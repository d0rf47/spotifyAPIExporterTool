// ============================================
// APPLICATION CONFIGURATION
// ============================================

const config = {
  // Spotify API Configuration
  spotify: {
    clientId: 'e174079272c149288253cceaaee0a069',
    redirectUri: 'http://127.0.0.1:8888/callback',
    scopes: ['user-library-read']
  },

  // Server Configuration
  server: {
    port: 8888,
    host: '127.0.0.1'
  },

  // Fetch Configuration
  fetch: {
    limit: 50, // Max items per request
    delayMs: 100 // Delay between requests to avoid rate limiting
  }
};

module.exports = config;

