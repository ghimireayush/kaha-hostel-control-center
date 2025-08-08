// Simple Service Worker for basic caching
const CACHE_NAME = 'kaha-hostel-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/src/data/students.json',
  '/src/data/ledger.json'
];

// Simple caching - no complex strategies
const STATIC_FILES = [
  '/',
  '/index.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/src/data/')) {
    event.respondWith(staleWhileRevalidate(request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
  } else if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset))) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

// Cache-first strategy (for static assets)
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache-first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network-first strategy (for API calls)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline', { 
      status: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Offline', cached: false })
    });
  }
}

// Stale-while-revalidate strategy (for data files)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  // Fetch fresh data in the background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.error('Background fetch failed:', error);
      return cachedResponse;
    });

  // Return cached response immediately if available
  if (cachedResponse) {
    // Update cache in background
    fetchPromise.catch(() => {}); // Ignore background errors
    return cachedResponse;
  }

  // If no cache, wait for network
  return fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
      try {
        await processOfflineAction(action);
        await removeOfflineAction(action.id);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function processOfflineAction(action) {
  const { type, data, endpoint } = action;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }

  return response.json();
}

// IndexedDB helpers for offline actions
async function getOfflineActions() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineActions', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['actions'], 'readonly');
      const store = transaction.objectStore('actions');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('actions')) {
        db.createObjectStore('actions', { keyPath: 'id' });
      }
    };
  });
}

async function removeOfflineAction(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineActions', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Push notifications for real-time updates
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const { title, body, icon, badge, tag } = data;

    const options = {
      body,
      icon: icon || '/kaha-logo.svg',
      badge: badge || '/kaha-logo.svg',
      tag: tag || 'default',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('Push notification error:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling for cache updates
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CACHE_UPDATE':
      updateCache(payload);
      break;
    case 'CLEAR_CACHE':
      clearCache(payload.cacheName);
      break;
  }
});

async function updateCache(payload) {
  const { cacheName, url, data } = payload;
  const cache = await caches.open(cacheName || DYNAMIC_CACHE);
  
  const response = new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  await cache.put(url, response);
}

async function clearCache(cacheName) {
  if (cacheName) {
    await caches.delete(cacheName);
  } else {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
}