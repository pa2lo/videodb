// self.addEventListener('fetch', function() {
//     return;
// });
const reloadVersion = 5;
self.addEventListener('install', function(event) {
	event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', () => {
	console.log('sw activate new');
	clients.claim();
});