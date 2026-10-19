// Compile current JS sources and every executable canonical script without running
// their DOM/storage code. This is syntax coverage, not behavioral acceptance.
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const map = JSON.parse(fs.readFileSync(path.join(__dirname, 'module-map.json'), 'utf8'));
const files = new Set(Object.values(map.groups).flatMap(g => [...g.sources, ...g.checks, ...g.install])
  .filter(p => /\.(?:js|cjs)$/.test(p)));
for (const item of map.export_integrations)
  for (const name of typeof item === 'string' ? [item] : item.files) files.add('work/' + name);
for (const file of files) new vm.Script(fs.readFileSync(path.join(root, file), 'utf8'), {filename: file});
const html = fs.readFileSync(map.canonical, 'utf8');
let scripts = 0;
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
  if (/application\/json/.test(match[1])) continue;
  new vm.Script(match[2], {filename: 'canonical-script-' + (++scripts)});
}
console.log(`PASS syntax: ${files.size} mapped JS sources/checks + ${scripts} executable canonical scripts.`);
