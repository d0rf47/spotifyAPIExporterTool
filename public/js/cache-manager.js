// ============================================
// LOCALSTORAGE CACHE MANAGER
// ============================================

const CACHE_KEY = 'spotify_liked_songs_cache';
const CACHE_TIMESTAMP_KEY = 'spotify_liked_songs_timestamp';

/**
 * Save songs to localStorage
 * @param {Array} songs - Array of song objects
 * @returns {boolean} - Success status
 */
function saveSongsToCache(songs) {
  try {
    const dataToCache = {
      songs: songs,
      timestamp: new Date().toISOString(),
      count: songs.length
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
    console.log(`✓ Saved ${songs.length} songs to cache`);
    return true;
  } catch (error) {
    console.error('Failed to save to cache:', error);
    return false;
  }
}

/**
 * Load songs from localStorage
 * @returns {Object|null} - Cached data object or null if not found
 */
function loadSongsFromCache() {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) {
      return null;
    }
    
    const parsed = JSON.parse(cachedData);
    console.log(`✓ Loaded ${parsed.count} songs from cache (${new Date(parsed.timestamp).toLocaleString()})`);
    return parsed;
  } catch (error) {
    console.error('Failed to load from cache:', error);
    return null;
  }
}

/**
 * Check if cache exists
 * @returns {boolean} - True if cache exists
 */
function hasCachedSongs() {
  return localStorage.getItem(CACHE_KEY) !== null;
}

/**
 * Get cache info (timestamp, count) without loading full data
 * @returns {Object|null} - Cache metadata or null
 */
function getCacheInfo() {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) {
      return null;
    }
    
    const parsed = JSON.parse(cachedData);
    return {
      timestamp: parsed.timestamp,
      count: parsed.count,
      formattedDate: new Date(parsed.timestamp).toLocaleString()
    };
  } catch (error) {
    console.error('Failed to get cache info:', error);
    return null;
  }
}

/**
 * Clear the cache
 * @returns {boolean} - Success status
 */
function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('✓ Cache cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return false;
  }
}

/**
 * Get the age of the cache in hours
 * @returns {number|null} - Cache age in hours or null if no cache
 */
function getCacheAge() {
  const info = getCacheInfo();
  if (!info) {
    return null;
  }
  
  const cacheDate = new Date(info.timestamp);
  const now = new Date();
  const ageInMs = now - cacheDate;
  return ageInMs / (1000 * 60 * 60); // Convert to hours
}

