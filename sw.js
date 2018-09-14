importScripts('js/idb.js');

let staticCacheName = 'mws-restaurant-v1';
let restaurantDB = 'RestaurantDB';
let siteOrigin = 'https://mws-restaurant-stage-1-tjbarre1.codeanyapp.com';
let dataOrigin = 'https://mws-restaurant-stage-2-tjbarre1.codeanyapp.com';

self.addEventListener('install', function(event) {
  console.log('The sw was installed!');

  event.waitUntil(
    idb.open(restaurantDB, 1, upgradeDB => {
      upgradeDB.createObjectStore('restaurants', {
        keyPath: 'id'
      })
    })
  );

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
        '/css/styles.css'
      ])
    })
  )
});

self.addEventListener('fetch', function(event) {

  if (new URL(event.request.url).origin == siteOrigin) {
    event.respondWith(
      caches.match(event.request, {
        ignoreSearch: true
      }).then(function(response) {
        return response || fetch(event.request).then(function(response) {
          return caches.open(staticCacheName).then(function(cache) {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  } else if (new URL(event.request.url).origin == dataOrigin) {
    if (!indexedDB) {
      console.log("No indexedDB");
      event.respondWith(fetch(event.request));
    } else {
      let restaurantID = new URL(event.request.url).pathname; // Get specific restaurant
      if (restaurantID.toUpperCase() === "/RESTAURANTS") {
        restaurantID = "All";
      } else {
        restaurantID = restaurantID.slice(13 - restaurantID.length);
      }

      event.respondWith( // returning [[PromiseValue]]: "[object Promise]"
        idb.open('RestaurantDB', 1).then(db => {
          return db.transaction('restaurants', 'readwrite')
            .objectStore('restaurants').get(restaurantID);
        }).then(obj => {
          if (obj) { // Return it
            return obj.data;
          } else { // If it does not exist, request it and create it
            return fetch(event.request).then(response => {
              return response.json();
            }).then(response => {
              return idb.open('RestaurantDB', 1).then(db => {
                let tx = db.transaction('restaurants', 'readwrite');
                tx.objectStore('restaurants').put({
                  id: restaurantID,
                  data: response
                });
                return response;
              });
            });
          } 
        }).then(finalResponse => {  // Check if this works or not
          return new Response(JSON.stringify(finalResponse));
        }).catch(error => {
          return new Response("Error fetching data", {status: 500})
        })
      );
    }
  } else {
    event.respondWith(fetch(event.request));
  }
});