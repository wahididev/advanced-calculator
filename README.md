# Advanced Calculator — Full feature set

This commit adds a large set of powerful features requested:

- BigNumber support & math.js configuration (precision 64)
- Complex number support via math.js
- Calculus helpers: derivative() (symbolic when available) and integral() (numeric Simpson's rule)
- Simple plotting modal with a small canvas plotter (no external plotting library)
- Equation solver (bisection method) modal
- Matrix, conversions and advanced math are exposed via math.js helpers; UI has buttons for quick access
- Help overlay and keyboard shortcuts
- math-loader.js added to attempt local vendor math.js first and fall back to CDN (you can replace /assets/vendor/math.min.js with a tree-shaken local build later)

To test:
1. Serve the repo root over HTTP: python -m http.server 8000
2. Open http://localhost:8000
3. Try examples from Help. For plotting, open "Plot f(x)", type sin(x) and press Enter.

Notes & next steps:
- I left a loader (assets/math-loader.js) that prefers a local vendor file at /assets/vendor/math.min.js — if you want a fully local, tree-shaken math.js, build mathjs for the browser and place it at that path. I can do that for you or add a small rollup build step.
- Tests/CI can be added in a follow-up; I can add GitHub Actions + tests on request.
