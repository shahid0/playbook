// Answers from the cache straight away, so the app opens at the gym with no signal, and refreshes the cache in the
// background: a new version shows up the next time it's opened. Covers this site and the Google Fonts it loads.
const CACHE = "playbook";
const cacheable = (url) => url.startsWith(self.registration.scope) || /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(["./", "assets/plate.webp", "assets/stack.webp", "assets/thali.webp"])));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !cacheable(request.url)) return;
  const fresh = fetch(request).then(async (response) => {
    // a font stylesheet loads without CORS, so it comes back opaque: still worth keeping
    if (response.ok || response.type === "opaque") await (await caches.open(CACHE)).put(request, response.clone());
    return response;
  });
  event.waitUntil(fresh.catch(() => {}));
  event.respondWith(caches.open(CACHE).then((cache) => cache.match(request)).then((hit) => hit || fresh));
});
