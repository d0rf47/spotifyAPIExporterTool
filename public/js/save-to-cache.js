// ============================================
// SAVE RESULTS TO CACHE
// ============================================

// This script runs on the results page and saves the displayed songs to cache
// It also handles the cache status badge

window.addEventListener('DOMContentLoaded', function() {
  // Get the songs data from the page
  const table = document.querySelector('table tbody');
  if (!table) {
    console.log('No table found, skipping cache save');
    return;
  }
  
  // Extract song data from the table rows
  const rows = table.querySelectorAll('tr');
  const songs = [];
  
  rows.forEach((row) => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 4) {
      const track = {
        track: {
          name: cells[1].textContent.trim(),
          album: {
            name: cells[2].textContent.trim()
          },
          artists: cells[3].textContent.trim().split(', ').map(name => ({ name: name.trim() }))
        }
      };
      songs.push(track);
    }
  });
  
  // Save to cache if we have songs
  if (songs.length > 0) {
    try {
      const dataToCache = {
        songs: songs,
        timestamp: new Date().toISOString(),
        count: songs.length
      };
      
      localStorage.setItem('spotify_liked_songs_cache', JSON.stringify(dataToCache));
      console.log(`✓ Saved ${songs.length} songs to cache`);
      
      // Show fresh data badge if this is from a fetch
      const urlParams = new URLSearchParams(window.location.search);
      const isCached = urlParams.get('cached') === 'true';
      
      // Add cache status badge
      const statsDiv = document.querySelector('.stats');
      if (statsDiv && !document.querySelector('.cache-status-badge')) {
        const badge = document.createElement('span');
        badge.className = `cache-status-badge ${isCached ? 'cached' : 'fresh'}`;
        badge.textContent = isCached ? '💾 From Cache' : '🔄 Fresh Data';
        statsDiv.appendChild(badge);
      }
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  }
});

