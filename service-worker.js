const CACHE_NAME = 'tournament-app-cache-v3';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo_192.png',
  '/logo_512.png',
  // CSS files
  '/css/general.css',
  '/css/header.css',
  '/css/match-setup.css',
  '/css/tournament-overview.css',
  '/css/match-overview.css',
  '/css/player-overview.css',
  '/css/context-menu.css',
  '/css/table.css',
  '/css/effects.css',
  '/css/popup.css',
  '/css/number-pad.css',
  '/css/finals.css',
  // JavaScript files
  '/UI-popup.js',
  '/events.js',
  '/UI-finals.js',
  '/UI-main.js',
  '/UI-matchSetup.js',
  '/UI-player-utils.js',
  '/UI-players.js',
  '/UI-tournament.js',
  '/UI-tournaments-list.js',
  '/UI-swiss.js',
  '/utils.js',
  '/finals-logic.js',
  '/generate_finals_structure.js',
  '/generate_group_sizes.js',
  '/generateMatches.js',
  '/generateSelectList.js',
  '/shuffle-players.js',
  '/swiss.js',
  '/tournamentSystems.js',
  '/score-logics.js',
  // Classes
  '/classes/Match.js',
  '/classes/Player.js',
  '/classes/Round.js',
  '/classes/Tournament.js',
  '/classes/TournamentManager.js',
  '/classes/TournamentSettings.js',
  // JSON files
  '/finals_structure_detailed.json',
  '/finals_structure.json',
  '/recommended_group_sizes.json',
  // Content images
  '/content/images/nhf-logo.png',
  // Startcard files
  '/startkort/fitTextInCell.js',
  '/startkort/startcard-template.js',
  '/startkort/startcard.css',
  '/startkort/startcard.html',
  '/startkort/startCards.js',
  // Development utilities
  '/cache-utils.js'
];

self.addEventListener('install', event => {
  console.log('Service Worker installing... Cache version:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell - total files:', URLS_TO_CACHE.length);
        return cache.addAll(URLS_TO_CACHE.map(url => {
          console.log('Caching:', url);
          return url;
        }));
      })
      .then(() => {
        console.log('All files cached successfully');
        self.skipWaiting();
      })
      .catch(error => {
        console.error('Failed to cache files:', error);
        throw error;
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }
        
        console.log('Fetching from network:', event.request.url);
        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache the fetched resource for future use
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Return a fallback for failed requests
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Send message to clients when cache is updated
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notify clients about cache updates
function notifyClients(message) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(message);
    });
  });
}
