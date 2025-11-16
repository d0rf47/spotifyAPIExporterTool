// ============================================
// LOAD AND DISPLAY CACHED SONGS
// ============================================

let cachedSongsData = [];
let currentSort = { by: 'index', order: 'asc' };

window.addEventListener('DOMContentLoaded', function() {
  loadAndDisplayCachedSongs();
});

function loadAndDisplayCachedSongs() {
  const loadingMessage = document.getElementById('loading-message');
  const resultsContent = document.getElementById('results-content');
  const errorMessage = document.getElementById('error-message');
  
  // Try to load cached data
  const cachedData = loadSongsFromCache();
  
  if (!cachedData || !cachedData.songs || cachedData.songs.length === 0) {
    // No cached data found
    loadingMessage.style.display = 'none';
    errorMessage.style.display = 'block';
    return;
  }
  
  // Store the data globally for sorting
  cachedSongsData = cachedData.songs;
  
  // Update UI with cached data
  document.getElementById('song-count').textContent = cachedData.count;
  document.getElementById('export-date').textContent = `Cached on ${new Date(cachedData.timestamp).toLocaleString()}`;
  
  // Render the songs table
  renderSongsTable(cachedSongsData);
  
  // Show results, hide loading
  loadingMessage.style.display = 'none';
  resultsContent.style.display = 'block';
  
  console.log(`✓ Displayed ${cachedData.count} cached songs`);
}

function renderSongsTable(songs) {
  const tbody = document.getElementById('songs-table-body');
  tbody.innerHTML = '';
  
  songs.forEach((item, index) => {
    const track = item.track;
    const artists = Array.isArray(track.artists) 
      ? track.artists.map(a => a.name).join(', ')
      : track.artists; // In case it's already a string
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(track.name)}</td>
      <td>${escapeHtml(track.album.name)}</td>
      <td>${escapeHtml(artists)}</td>
      <td>
        <a href="#" 
           class="download-mp3-link" 
           onclick="downloadMP3(event, '${escapeHtml(track.name)}', '${escapeHtml(artists)}')">
          🎵 MP3
        </a>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function sortTable(column) {
  // Toggle sort order if clicking the same column
  if (currentSort.by === column) {
    currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.by = column;
    currentSort.order = 'asc';
  }
  
  // Sort the data
  const sorted = [...cachedSongsData].sort((a, b) => {
    let valueA, valueB;
    
    switch (column) {
      case 'track':
        valueA = a.track.name.toLowerCase();
        valueB = b.track.name.toLowerCase();
        break;
      case 'album':
        valueA = a.track.album.name.toLowerCase();
        valueB = b.track.album.name.toLowerCase();
        break;
      case 'artist':
        const artistsA = Array.isArray(a.track.artists) 
          ? a.track.artists[0].name 
          : a.track.artists;
        const artistsB = Array.isArray(b.track.artists) 
          ? b.track.artists[0].name 
          : b.track.artists;
        valueA = artistsA.toLowerCase();
        valueB = artistsB.toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (valueA < valueB) return currentSort.order === 'asc' ? -1 : 1;
    if (valueA > valueB) return currentSort.order === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Re-render the table
  renderSongsTable(sorted);
  
  // Update sort icons
  updateSortIcons(column, currentSort.order);
}

function updateSortIcons(sortedColumn, order) {
  const headers = document.querySelectorAll('th.sortable');
  headers.forEach(th => {
    const icon = th.querySelector('.sort-icon');
    if (!icon) return;
    
    const columnName = th.getAttribute('onclick').match(/sortTable\('(\w+)'\)/)[1];
    if (columnName === sortedColumn) {
      icon.textContent = order === 'asc' ? '▲' : '▼';
    } else {
      icon.textContent = '⇅';
    }
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

