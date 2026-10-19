const fs=require('fs');
const esbuild=require(process.env.COLOR_ATLAS_ESBUILD||'/Users/raffribeiro/Documents/Codex/RPG_Narrator/narrative-engine/node_modules/esbuild');
const source=fs.readFileSync('work/atlas-lab-live-color.js','utf8');
const bundle=esbuild.transformSync(source,{minify:true,target:'es2022'}).code;
fs.writeFileSync('work/atlas-lab-live-color-bundle.js',bundle);
console.log('3D interaction module:',source.length,'→',bundle.length,'bytes');
