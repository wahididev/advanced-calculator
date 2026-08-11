#!/usr/bin/env node
// tools/build-math.js
// Bundles a browser-ready, tree-shaken math.js into assets/vendor/math.min.js using esbuild.
// Usage: node tools/build-math.js

const { build } = require('esbuild');
const path = require('path');

(async ()=>{
  try{
    const out = path.resolve(__dirname, '..', 'assets', 'vendor', 'math.min.js');
    await build({
      entryPoints: [path.resolve(__dirname, 'math-entry.js')],
      bundle: true,
      minify: true,
      sourcemap: false,
      platform: 'browser',
      target: ['es2017'],
      outfile: out,
      define: { 'process.env.NODE_ENV': '"production"' }
    });
    console.log('Built math bundle at', out);
  }catch(err){
    console.error('Build failed:', err);
    process.exit(1);
  }
})();
