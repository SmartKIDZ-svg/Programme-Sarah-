// ══════════════════════════════════════
// SERVICE WORKER — Sarah Fit
// Tourne en arrière-plan même quand l'app est fermée
// ══════════════════════════════════════

const CACHE_NAME = 'sarah-fit-v1';

// Install
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});

// Fetch — serve from cache if available
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});

// ── MESSAGE from app ──
// App sends messages to SW to track session state
var sessionState = null;

self.addEventListener('message', function(e) {
  var data = e.data;

  if (data.type === 'SESSION_START') {
    sessionState = {
      startedAt: Date.now(),
      stepLabel: data.stepLabel,
      stepType: data.stepType,
      reposRunning: data.reposRunning,
      reposDurMs: data.reposDurMs,
      reposElapsedMs: data.reposElapsedMs,
      reposStartTime: Date.now(),
      reposLabel: data.reposLabel
    };
  }

  if (data.type === 'SESSION_UPDATE') {
    if (sessionState) {
      sessionState.stepLabel = data.stepLabel;
      sessionState.stepType = data.stepType;
      sessionState.reposRunning = data.reposRunning;
      sessionState.reposDurMs = data.reposDurMs;
      sessionState.reposElapsedMs = data.reposElapsedMs;
      sessionState.reposStartTime = Date.now();
      sessionState.reposLabel = data.reposLabel;
      sessionState.stepElapsedMs = data.stepElapsedMs;
      sessionState.stepStartTime = Date.now();
      sessionState.stepDurationMs = data.stepDurationMs;
      sessionState.stepIsCountdown = data.stepIsCountdown;
      sessionState.hiddenAt = data.hiddenAt;
    }
  }

  if (data.type === 'SESSION_END') {
    sessionState = null;
  }

  if (data.type === 'GET_ELAPSED') {
    // App asking how much time passed since hiddenAt
    if (sessionState && sessionState.hiddenAt) {
      var elapsed = Date.now() - sessionState.hiddenAt;
      e.source.postMessage({
        type: 'ELAPSED_RESPONSE',
        elapsed: elapsed,
        sessionState: sessionState
      });
    } else {
      e.source.postMessage({ type: 'ELAPSED_RESPONSE', elapsed: 0 });
    }
  }
});
