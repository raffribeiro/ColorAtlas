const fs=require('fs');
const esbuild=require(process.env.COLOR_ATLAS_ESBUILD||'/Users/raffribeiro/Documents/Codex/RPG_Narrator/narrative-engine/node_modules/esbuild');
const code=fs.readFileSync('work/atlas-preview-layers-core.js','utf8')+fs.readFileSync('work/atlas-preview-layers.js','utf8')+fs.readFileSync('work/atlas-preview-presets.js','utf8');
const min=esbuild.transformSync(code,{minify:true,target:'es2022'}).code;
if(!min.includes('function previewComposite(')||!min.includes('function initializePreviewLayers('))throw new Error('Preserve app integration names');
fs.writeFileSync('work/atlas-preview-layers-bundle.js','// Independent image Gradient Maps; compiled app modules.\n'+min+'// End Preview image stack.\n');
console.log('Preview modules:',code.length,'→',min.length,'bytes');

// Preserve the existing Random algorithms while compiling the optional batch flag.
const random=fs.readFileSync('work/atlas-random-generation.js','utf8').split(/(\/\/ ColorPlay contextual generation\n[\s\S]*?\/\/ End ColorPlay contextual generation\n)/).map((part,index)=>index%2?part:esbuild.transformSync(part,{minify:true,target:'es2022'}).code).join('');
fs.writeFileSync('work/atlas-random-generation-bundle.js',random);
const edits=JSON.parse(fs.readFileSync('work/preview-multiselect-script-edits.json','utf8'));
edits[0][1]=random;fs.writeFileSync('work/preview-multiselect-script-edits.json',JSON.stringify(edits,null,2)+'\n');
