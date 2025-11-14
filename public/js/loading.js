// ============================================
// LOADING PAGE - STATUS CHECKER
// ============================================

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

