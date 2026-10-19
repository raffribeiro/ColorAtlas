// Run the existing compilers with a read-only filesystem facade. Compare their
// expected outputs to disk without rebuilding, reinstalling or publishing.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const esbuild = require(process.env.COLOR_ATLAS_ESBUILD ||
  '/Users/raffribeiro/Documents/Codex/RPG_Narrator/narrative-engine/node_modules/esbuild');
const normalizeJS = code => esbuild.transformSync(code, {minify: true, target: 'es2022'}).code;
let count = 0;
for (const compiler of ['build_workspace_modules.cjs', 'build_lab_live_color.cjs', 'build_splash.cjs', 'build_preview_layers.cjs']) {
  const expected = [];
  const readOnly = {...fs, writeFileSync(file, code) { expected.push([file, code]); }};
  const localRequire = name => name === 'fs' ? readOnly : require(name);
  vm.runInNewContext(fs.readFileSync('work/' + compiler, 'utf8'),
    {require: localRequire, process, console: {log() {}}}, {filename: compiler});
  for (const [file, code] of expected) {
    const current = fs.readFileSync(file, 'utf8');
    // Minifier versions and historical formatting can print .30 vs .3; compare
    // normalized executable JS, not inconsequential spelling. Data/CSS stay exact.
    const same = file.endsWith('.js') ? normalizeJS(current) === normalizeJS(code) : current === code;
    assert(same, `${file} is stale; inspect and run work/${compiler}, then its source owner's installer`);
    count++;
  }
}
console.log(`PASS: ${count} compiler outputs match current sources; no files were written.`);
