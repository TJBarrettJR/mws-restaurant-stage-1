let staticCacheName = 'mws-restaurant-v1';
let siteOrigin = 'https://mws-restaurant-stage-1-tjbarre1.codeanyapp.com';

self.addEventListener('install', function(event) {
  console.log('The sw was installed!');
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '/',
        '/restaurant.html',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/img/1.jpg',
        '/img/2.jpg',
        '/img/3.jpg',
        '/img/4.jpg',
        '/img/5.jpg',
        '/img/6.jpg',
        '/img/7.jpg',
        '/img/8.jpg',
        '/img/9.jpg',
        '/img/10.jpg',
        '/data/restaurants.json',
        '/css/styles.css'
      ])
    })
  )
});

self.addEventListener('fetch', function(event) {  
  
  if (new URL(event.request.url).origin !== siteOrigin) {
    fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request, {ignoreSearch: true}).then(function(response) {
      return response || fetch(event.request).then(function(response) {
        return caches.open(staticCacheName).then(function(cache) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});