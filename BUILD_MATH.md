# Build instructions for a local, tree-shaken math.js bundle

This repository now includes a small build tool to produce a local math.js browser bundle at /assets/vendor/math.min.js. The app will prefer this local file and no longer falls back to the CDN. This keeps the app self-contained and suitable for offline use.

How it works
1. tools/math-entry.js creates a math.js instance and attaches it to window.math.
2. tools/build-math.js uses esbuild to bundle that entry file along with mathjs into a single minified file: assets/vendor/math.min.js.

To build locally (requires Node.js):

1. Install dev dependencies (you can use npm or yarn):
   npm install

2. Run the build script:
   npm run build:math

3. Serve the site (so service worker works):
   python -m http.server 8000

4. Open http://localhost:8000 and the app will load the local math bundle.

Notes
- The current build bundles mathjs with esbuild. You can further customize the entry file (tools/math-entry.js) to import only specific mathjs sub-modules if you want a smaller bundle.
- After building, commit /assets/vendor/math.min.js to the repo if you want the bundle to be included for others without requiring build steps.
