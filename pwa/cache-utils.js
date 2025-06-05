// Cache management utilities for development
// You can copy and paste these functions into the browser console

// Clear all caches and reload the page
async function clearCacheAndReload() {
  try {
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
      }
      console.log('All service workers unregistered');
    }
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    }
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    console.log('Storage cleared');
    
    // Reload the page
    window.location.reload(true);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

// Force update service worker
async function forceUpdateServiceWorker() {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('service-worker.js');
      await registration.update();
      console.log('Service worker updated');
      
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  } catch (error) {
    console.error('Error updating service worker:', error);
  }
}

// Check cache contents
async function inspectCache() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    console.log('Available caches:', cacheNames);
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      console.log(`Cache "${cacheName}" contains:`, requests.map(req => req.url));
    }
  }
}

// Test offline functionality
async function testOffline() {
  try {
    console.log('Testing offline functionality...');
    
    // Check service worker status
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      console.log('✓ Service worker is active');
    } else {
      console.log('✗ No active service worker');
      return;
    }
    
    // Check if critical files are cached
    const criticalFiles = ['/', '../index.html', 'manifest.json'];
    const cacheNames = await caches.keys();
    const currentCache = cacheNames.find(name => name.includes('tournament-app-cache'));
    
    if (!currentCache) {
      console.log('✗ No tournament cache found');
      return;
    }
    
    const cache = await caches.open(currentCache);
    let allCached = true;
    
    for (const file of criticalFiles) {
      const response = await cache.match(file);
      if (response) {
        console.log(`✓ ${file} is cached`);
      } else {
        console.log(`✗ ${file} is NOT cached`);
        allCached = false;
      }
    }
    
    if (allCached) {
      console.log('🎉 App should work offline!');
    } else {
      console.log('⚠️ App may not work properly offline');
    }
    
  } catch (error) {
    console.error('Error testing offline:', error);
  }
}

console.log('Cache utilities loaded! Available functions:');
console.log('- clearCacheAndReload() - Clears everything and reloads');
console.log('- forceUpdateServiceWorker() - Forces service worker update');
console.log('- inspectCache() - Shows what is currently cached');
console.log('- testOffline() - Tests if app will work offline');
