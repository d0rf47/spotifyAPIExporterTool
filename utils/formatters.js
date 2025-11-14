// ============================================
// CONTENT FORMATTERS
// ============================================

/**
 * Helper function to format duration from milliseconds
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration (mm:ss)
 */
function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Helper function to escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
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

/**
 * Create simple text format content
 * @param {Array} songs - Array of song items
 * @returns {string} Formatted content
 */
function createSimpleFormat(songs) {
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

/**
 * Create detailed text format content
 * @param {Array} songs - Array of song items
 * @returns {string} Formatted content
 */
function createDetailedFormat(songs) {
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

/**
 * Create Spotify URI format content
 * @param {Array} songs - Array of song items
 * @returns {string} Formatted content
 */
function createURIFormat(songs) {
  let content = '# Spotify Track URIs - Use for playlist import\n';
  content += `# Total: ${songs.length} songs\n`;
  content += `# Exported: ${new Date().toLocaleString()}\n\n`;
  
  songs.forEach((item) => {
    content += `${item.track.uri}\n`;
  });
  
  return content;
}

/**
 * Create CSV format content
 * @param {Array} songs - Array of song items
 * @returns {string} Formatted content
 */
function createCSVFormat(songs) {
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

module.exports = {
  formatDuration,
  escapeHtml,
  createSimpleFormat,
  createDetailedFormat,
  createURIFormat,
  createCSVFormat
};

