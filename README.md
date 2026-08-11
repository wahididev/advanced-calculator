# Advanced Calculator — Powerful

This update enhances the calculator with the following features:

- Advanced math powered by math.js (via CDN): trig, logs, powers, constants, and more.
- Scientific buttons and a toggle to reveal/hide the scientific panel.
- Memory functions: MC, MR, M+, M- with a simple display.
- Export and clear history; history length increased.
- Simple service worker (sw.js) to cache the app and enable offline use.

Notes & security
- Using math.js via CDN makes it easy to evaluate complex expressions safely; it still evaluates formulas, so avoid evaluating untrusted user input on a server without sandboxing.
- The service worker caches core assets; adjust the cache strategy for more advanced offline behaviors.

To test locally
1. Serve the repo root (for service worker to register use a server; file:// won't work):
   python -m http.server 8000
2. Open http://localhost:8000 and try scientific functions (sin(pi/2) -> 1), memory operations, and export history.
