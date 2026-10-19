const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]')return null;if(!nodes.has(k))nodes.set(k,{value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v}},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){},appendChild(){},append(){},replaceChildren(){},focus(){},querySelector(){return null},contains(){return false},options:[]});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const context={Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root},createElement:()=>node('created-'+Math.random()),body:{appendChild(){}},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},structuredClone,window:{openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(){return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,restore,gradientPresets,applyGradientPreset,renderStudioLibrary,rgbToLab,gradientSample,studioLibraryGroups:typeof studioLibraryGroups==="function"?studioLibraryGroups:null,libraryFolderIsOpen:typeof libraryFolderIsOpen==="function"?libraryFolderIsOpen:null}; new ResizeObserver'),context);








const app=context.inspectMunsell,added=app.gradientPresets.filter(p=>p.id.startsWith('painterly-tone-'));
const original=JSON.parse(fs.readFileSync('work/templates-before-tone-refinement.json','utf8'));
const oldTone=original.filter(p=>p.id.startsWith('painterly-tone-')),other=original.filter(p=>!p.id.startsWith('painterly-tone-'));
assert.deepEqual(JSON.parse(JSON.stringify(app.gradientPresets.filter(p=>other.some(q=>q.id===p.id)))),other,'Only refine the requested Tone Shift palettes');
assert.deepEqual(Array.from(added,p=>p.id),oldTone.map(p=>p.id),'Keep favorite identities');
assert.deepEqual(Array.from(added,p=>p.name),oldTone.map(p=>p.name),'Keep recognizable names');
for(const p of added){
 assert(p.colors.length>=8&&p.colors.length<=16,'Each refined palette has room for reflected-color accents');
 const colors=p.colors.map(hex=>{const lab=app.rgbToLab(hex);return {c:Math.hypot(lab.a,lab.b)/250,h:Math.atan2(lab.b,lab.a)*180/Math.PI}});
 const peaks=colors.filter((c,i)=>i>0&&i<colors.length-1&&c.c>colors[i-1].c+.01&&c.c>colors[i+1].c+.01);
 assert(peaks.length>=2,p.name+' has at least two deliberate saturation accents');
 const turns=colors.slice(1).map((c,i)=>(c.h-colors[i].h+540)%360-180).filter(d=>Math.abs(d)>8);
 let reversals=0;for(let i=1;i<turns.length;i++)if(Math.sign(turns[i])!==Math.sign(turns[i-1]))reversals++;
 assert(reversals>=2,p.name+' has intentional warm/cool returns instead of one hue sweep');
 const old=oldTone.find(q=>q.id===p.id);assert.notDeepEqual(Array.from(p.colors),old.colors,'Every requested palette is revised');
 const oldPeak=Math.max(...old.colors.map(hex=>{const q=app.rgbToLab(hex);return Math.hypot(q.a,q.b)/250}));
 assert(Math.max(...colors.map(q=>q.c))>=oldPeak+.015,p.name+' gains a stronger chromatic focal region');
}
console.log('PASS: refined Tone Shift only; stable IDs/names, repeated chroma accents, warm/cool returns and stronger focal colors.');
