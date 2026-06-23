const CACHE_NAME = 'svarog-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/about.html',
  '/support.html',
  '/shop.html',
  '/contact.html',
  '/status.html',
  '/admin.html',
  '/logo.png',
  '/SvarogTeam.png',
  '/bg1.jpg',
  '/bg2.jpg',
  '/bg3.jpg'
];

// Інсталяція: Кешуємо всі базові файли дизайну
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Активація: Видаляємо старий кеш, якщо оновили версію
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Стратегія "Мережа з відкатом на кеш" (щоб бачити свіжі замовлення, але працювати офлайн)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  )
});
