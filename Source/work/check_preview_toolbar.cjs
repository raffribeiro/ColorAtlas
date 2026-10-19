const fs=require('fs'),assert=require('assert'),vm=require('vm');
const source=fs.readFileSync('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
const markup=source.slice(0,source.indexOf('<style>'));
const bar=source.match(/<div class="studio-preview-toolbar">([\s\S]*?)<\/div>/)?.[1];
assert(!markup.includes('<h3>03 · PREVIEW MAP</h3>'),'Preview title is removed');assert(bar&&!bar.includes('<h3>'),'Settings remain on their own single toolbar row');
assert(bar,'Preview settings must share one compact toolbar');
for(const marker of ['data-action="random-all-layers"','id="random-type"','id="color-vision"','id="attention-toggle"']){
 assert(bar.includes(marker),'Toolbar must retain '+marker);
 assert.equal(markup.split(marker).length-1,1,'Keep one functional control for '+marker);
}
assert(bar.includes('aria-label="Color vision"')&&bar.includes('aria-label="Show estimated primary, secondary and tertiary attention"'),'Compact controls retain accessible names');
assert(!source.includes('#color-vision{width:100%;grid-column:1/3;grid-row:2}'),'No breakpoint may push Color vision onto another row');
assert(/\.studio-preview-toolbar\{[^}]*display:grid/.test(source),'Compact toolbar uses one explicit grid row');
assert(source.includes('.studio-preview-toolbar:has([data-action="colorplay-study"]:not([hidden])){grid-template-columns:auto minmax(0,1fr) auto minmax(0,1fr) auto}'),'Visible Compare gets a fifth grid column and cannot spill onto an implicit row');
assert(source.includes('grid-template-rows:auto var(--studio-fitted-list-size,minmax(84px,1fr)) auto auto'),'Reserve the wheel row before assigning height to the key list');
assert(source.includes("installIframeDropdown($('#color-vision'),'Color vision')"),'Keep iframe-safe dropdown behavior');
// Legacy embedded DOM must move the same nodes, retaining event handlers.
function node(){return {children:[],attrs:{},setAttribute(k,v){this.attrs[k]=v},appendChild(child){child.remove?.();child.parent=this;this.children.push(child)},remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this)},prepend(child){child.parent=this;this.children.unshift(child)}};}
const panel=node(),old=node(),note=node(),oldHeading=node(),controls=[node(),node(),node(),node()];
oldHeading.tagName='H3';panel.appendChild(oldHeading);panel.appendChild(old);panel.appendChild(note);controls.forEach(n=>old.appendChild(n));
controls[3].changeHandler=()=>{};const handler=controls[3].changeHandler;
const selectors=['[data-action="random-all-layers"]','#random-type','#color-vision','#attention-toggle'];
panel.querySelector=s=>s==='.studio-preview-toolbar'?panel.children.find(n=>n.className==='studio-preview-toolbar'):s==='#color-vision-note'?note:controls[selectors.indexOf(s)];
panel.querySelectorAll=selector=>selector===':scope > h3, .studio-preview-toolbar h3'?[...panel.children.filter(n=>n.tagName==='H3'),...(panel.querySelector('.studio-preview-toolbar')?.children.filter(n=>n.tagName==='H3')||[])]:[old];
const context={$:()=>panel,document:{createElement:node}};
vm.runInNewContext(source.slice(source.indexOf('function compactPreviewToolbar(){'),source.indexOf('function drawSystem(){')),context);
context.compactPreviewToolbar();
const mounted=panel.querySelector('.studio-preview-toolbar');
assert.equal(panel.children[0],mounted,'The toolbar is the first visible element, without a heading');assert(!panel.children.includes(oldHeading),'Legacy direct heading removed');
assert(mounted&&mounted.children.slice(0,3).every((n,i)=>n===controls[i]));
assert.equal(controls[3].parent.className,'studio-attention-control');
assert.equal(controls[3].changeHandler,handler);assert(!panel.children.includes(old));assert.equal(note.className,'sr-only');
const nestedHeading=node();nestedHeading.tagName='H3';mounted.appendChild(nestedHeading);context.compactPreviewToolbar();assert(!mounted.children.includes(nestedHeading),'Legacy nested toolbar heading removed');assert.equal(panel.children.filter(n=>n.className==='studio-preview-toolbar').length,1,'Migration is idempotent');
console.log('PASS: single preview toolbar, four retained controls, accessible names and wheel within its reserved grid row.');
