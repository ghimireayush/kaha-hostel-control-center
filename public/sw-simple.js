// Simple Service Worker - No optimizations
const CACHE_NAME = 'kaha-hostel-simple-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  self.clients.claim();
});

// Fetch event - just pass through
self.addEventListener('fetch', (event) => {
  // Just pass through all requests without caching
  return;
});