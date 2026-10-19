const fs=require('fs'),e=require(process.env.COLOR_ATLAS_ESBUILD||'/Users/raffribeiro/Documents/Codex/RPG_Narrator/narrative-engine/node_modules/esbuild');
for(const name of ['atlas-motion-ui','atlas-png-export','atlas-colorplay','atlas-workspace-resize','atlas-attention','atlas-preset-data','atlas-library-folders','atlas-preview-camera','atlas-preview-fit','atlas-documentation','atlas-editor-refinements']){
 let raw=fs.readFileSync('work/'+name+'.js','utf8');
 if(name==='atlas-library-folders'){
  const a=raw.indexOf('// Presentation taxonomy only;'),b=raw.indexOf('function studioLibraryGroups(',a);
  if(a<0||b<0)throw new Error('Missing library theme boundaries');
  raw=raw.slice(0,a)+fs.readFileSync('work/library-theme-rules.js','utf8')+raw.slice(b);
  // Compose generated taxonomy in memory. Compilation owns bundles, never sources.
 }
 let code=e.transformSync(raw,{minify:true,target:'es2022',charset:name==='atlas-preset-data'?'utf8':'ascii'}).code;
 if(name==='atlas-png-export')code='// PNG export options\n'+code+'// End PNG export options\n';
 if(name==='atlas-colorplay')code='// ColorPlay contextual generation\n'+code+'// End ColorPlay contextual generation\n';
 if(name==='atlas-attention')code=raw.split('\n').slice(0,2).join('\n')+'\n'+code;
 if(name==='atlas-preset-data')code='// Bundled preset data\n'+code+'// End bundled preset data\n';
 if(name==='atlas-library-folders')code='// Balanced library folders\n'+code+'// End balanced library folders\n';
 if(name==='atlas-editor-refinements')code='// Editor comparison and selection visibility.\n'+code+'// End editor comparison and selection visibility.\n';
 fs.writeFileSync('work/'+name+'-bundle.js',code);console.log(name,raw.length,'→',code.length);
}
fs.writeFileSync('work/author-wheel-layout-bundle.css',fs.readFileSync('work/author-wheel-layout.css','utf8').replace(/\/\*[\s\S]*?\*\//g,'').trim()+'\n');
