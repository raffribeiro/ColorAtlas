const fs=require('fs'),assert=require('assert');
const rows=JSON.parse(fs.readFileSync('work/art_design_templates.json','utf8'));
const counts=new Map();
assert.equal(rows.length,200);assert.equal(new Set(rows.map(p=>p.id)).size,200);
for(const p of rows){counts.set(p.movement,(counts.get(p.movement)||0)+1);assert(p.artist&&p.workTitle);assert(p.colors.length>=2&&p.colors.length<=16);assert(p.colors.every(c=>/^#[0-9A-F]{6}$/.test(c)));assert.equal(p.positions[0],0);assert.equal(p.positions.at(-1),1);assert(p.positions.every((v,i)=>i===0||v>p.positions[i-1]));assert.equal(p.transition,'smooth');}
assert.equal(counts.size,40);assert([...counts.values()].every(n=>n>=5&&n<=10));
const file=fs.readFileSync('outputs/munsell-color-picker.html','utf8');
assert(file.includes('studio-movement'));assert(file.includes('data:image/webp;base64,'));
console.log(`PASS: ${rows.length} palettes, ${counts.size} movements, valid 2–16 keys, Smooth defaults, movement filter and embedded preview.`);
