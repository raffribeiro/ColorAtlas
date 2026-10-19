// Render only generated comparison data, not the app or browser UI.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const sharp=require('/Users/raffribeiro/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
let bootstrap=fs.readFileSync('work/check_simple_random.cjs','utf8').split("console.log('PASS: full app")[0];
bootstrap=bootstrap.replace('resetDefaultExplosion,restore};','resetDefaultExplosion,restore,colorPlayContext,colorPlayLayers,colorPlayLUT,colorPlayComposite,colorPlayScore,makeColorPlayPair,setImage:(p,a)=>{explosionPixels=p;explosionAlpha=a;}};');
const harness={require,process,console,structuredClone};vm.runInNewContext(bootstrap+';globalThis.app=context.inspectMunsell;',harness);
(async()=>{
 const app=harness.app,state=app.state;
 const {data}=await sharp('outputs/default-explosion.webp').resize(512,512).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const p=new Uint8Array(512*512),a=new Uint8Array(p.length);let low=255,high=0;
 for(let i=0;i<p.length;i++){const j=4*i,g=.2126*data[j]+.7152*data[j+1]+.0722*data[j+2];if(data[j+3]){low=Math.min(low,g);high=Math.max(high,g);}}
 for(let i=0;i<p.length;i++){const j=4*i,g=.2126*data[j]+.7152*data[j+1]+.0722*data[j+2];p[i]=Math.round((g-low)*255/(high-low||1));a[i]=data[j+3];}
 state.system='vfx';state.explosionView='combined';app.setImage(p,a);
 let seed=97;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const start=performance.now(),pair=app.makeColorPlayPair(rng),elapsed=performance.now()-start,context=app.colorPlayContext(p,a),lut=app.colorPlayLUT(app.colorPlayLayers(pair));
 assert(Number.isFinite(app.colorPlayScore(pair,context)));
 const backgrounds=['#151b23','#e4e8ed'],layers=[];
 for(let i=0;i<2;i++){
  const bg=backgrounds[i].match(/[a-f0-9]{2}/gi).map(v=>parseInt(v,16)),rgba=Buffer.alloc(32*32*4);
  context.samples.forEach((s,j)=>rgba.set([...app.colorPlayComposite(lut[s.v],s.alpha,bg),255],j*4));
  const image=await sharp(rgba,{raw:{width:32,height:32,channels:4}}).resize(256,256).png().toBuffer();layers.push({input:image,left:24+i*280,top:48});
 }
 const patch=pair.emission[Math.floor(pair.emission.length/2)].hex;
 const svg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="584" height="436"><rect width="584" height="436" fill="#0e1621"/><g fill="#c9d9ed" font-family="sans-serif" font-size="14"><text x="24" y="28">ColorPlay · same palette, two backgrounds</text><text x="24" y="330">Identical centers: '+patch.toUpperCase()+'</text></g><rect x="24" y="348" width="256" height="64" fill="'+pair.emission[0].hex+'"/><rect x="304" y="348" width="256" height="64" fill="'+pair.emission.at(-1).hex+'"/><rect x="136" y="365" width="32" height="32" fill="'+patch+'"/><rect x="416" y="365" width="32" height="32" fill="'+patch+'"/></svg>');
 await sharp(svg).composite(layers).png().toFile('work/colorplay-context-study.png');
 console.log('PASS: actual bundled reference evaluated; 16 candidates in '+elapsed.toFixed(0)+' ms (local Node measurement), finite score; original comparison raster saved.');
})().catch(e=>{console.error(e);process.exitCode=1;});
