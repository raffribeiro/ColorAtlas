const assert=require('assert'),fs=require('fs');
const {harness}=require('./check_motion_ui.cjs');
function waves(h){return h.calls.filter(c=>typeof c.target==='number').map(c=>{
 c.options.onUpdate(.95);
 const property=Object.keys(h.root.style).find(k=>k.startsWith('--atlas-scale-')&&Number(h.root.style[k])===.95);
 c.options.onUpdate(1);return Object.assign(c,{property});
});}
function trigger(h,x,y){const b=h.element({'data-action':'random-all-layers'});b.tag='button';h.fire('click',b,{clientX:x,clientY:y,detail:1});h.flush();return waves(h);}
function validate(w){
 assert.equal(w.length,4,'all four circles animate, including the wheel located by its actual data-field');
 assert.equal(new Set(w.map(c=>c.property)).size,4,'independent per-view scales survive SVG redraw');
 assert.equal(w[0].options.delay,0,'nearest selector reacts first');
 assert.deepEqual(w.map(c=>c.options.delay),[0,0,0,0],'all selected circles start together without a stagger');
 assert(w.at(-1).options.delay<=.36,'bounded delay');
 for(const c of w){assert.deepEqual(Array.from(c.keyframes),[1,c.property==='--atlas-scale-ramp'?1.56:1.28,1],'only the gradient selector has double pulse amplitude');assert.equal(c.options.duration,.24);assert.deepEqual(Array.from(c.options.times),[0,.16,1]);assert.deepEqual(JSON.parse(JSON.stringify(c.options.ease)),[[.16,1,.3,1],[.22,1,.36,1]])}
}
{
 const h=harness(),w=trigger(h,850,150);validate(w);assert.equal(w[0].property,'--atlas-scale-keys');
 const other=harness(),reverse=trigger(other,100,100);validate(reverse);assert.equal(reverse[0].property,'--atlas-scale-author');
 assert.notDeepEqual(w.map(c=>c.property),reverse.map(c=>c.property),'origin changes propagation order');
 const large=harness();large.marks.keys.rect.left=2000;large.marks.wheel.rect.left=4000;large.marks.ramp.rect.left=8000;validate(trigger(large,100,100));
 const equal=harness();for(const mark of Object.values(equal.marks))mark.rect={left:100,top:100,width:20,height:20};validate(trigger(equal,100,100));
}
{
 const h=harness(),b=h.element({'data-action':'random-all-layers'});b.tag='button';b.rect={left:80,top:80,width:40,height:40};
 h.fire('click',b,{detail:0,clientX:0,clientY:0});h.flush();const w=waves(h);validate(w);assert.equal(w[0].property,'--atlas-scale-author','keyboard uses activating control center');
 const first=w;trigger(h,700,600);assert(first.every(c=>c.canceled),'new action cancels old delayed wave');
 h.media.matches=true;h.media.onchange();for(const id of ['author','keys','wheel','ramp'])assert.equal(h.root.style['--atlas-scale-'+id],'1');
}
{
 const h=harness(),b=h.element({'data-action':'random-all-layers'});b.tag='button';
 h.fire('click',b,{clientX:100,clientY:100,detail:1});h.fire('click',b,{clientX:700,clientY:600,detail:1});
 assert.equal(h.frames.size,1);h.flush();const w=waves(h);assert.equal(w.length,4);assert.equal(w[0].property,'--atlas-scale-ramp','latest origin wins within a frame');
 const hidden=harness();hidden.marks.author.rect={left:0,top:0,width:0,height:0};assert.equal(trigger(hidden,100,100).length,3,'hidden circles do not take a stagger slot');
}
{
 const h=harness(),slider=h.element();slider.id='vfx-saturation';slider.tag='input';slider.type='range';slider.min='0';slider.max='100';slider.value='60';slider.rect={left:50,top:80,width:300,height:20};
 h.fire('pointerdown',slider,{clientX:230,clientY:90});h.fire('input',slider);h.fire('input',slider);h.flush();assert.equal(waves(h).length,0,'drag edit waits for release');
 h.fire('input',slider);h.flush();assert.equal(waves(h).length,0,'continuous drag stays stable');
 h.fire('pointerup',slider);h.flush();assert.equal(waves(h).length,4,'release plays one wave');h.fire('pointerdown',slider);h.fire('input',slider);h.flush();assert.equal(waves(h).length,4,'next drag waits again');
 h.fire('pointerup',slider);h.flush();h.fire('keydown',slider,{key:'ArrowRight'});h.fire('input',slider);h.flush();h.fire('keydown',slider,{key:'ArrowRight',repeat:true});h.fire('input',slider);h.flush();assert.equal(waves(h).length,12,'keyboard repeats finish propagation without resetting it');
 h.fire('keyup',slider,{key:'ArrowRight'});h.fire('keydown',slider,{key:'ArrowRight'});h.fire('input',slider);h.flush();assert.equal(waves(h).length,16);
}
{
 const h=harness(),b=h.element();h.window.AtlasMotion.colorChanged({target:b,clientX:700,clientY:600,type:'pointerup'});h.flush();const w=waves(h);assert.equal(w[0].property,'--atlas-scale-ramp','model-confirmed edits carry their originating event');
}
const css=fs.readFileSync('work/atlas-motion-ui.css','utf8');
for(const id of ['author','keys','wheel','ramp'])assert(css.includes('--atlas-scale-'+id));
assert(css.includes('[data-selected-color]')&&css.includes('.wheel-color-marker.is-selected')&&css.includes('.studio-key-row[data-selected=true] .studio-key-swatch'),'colored centers scale with their borders');
console.log('PASS: simultaneous selector feedback, pointer/keyboard origins, stagger, redraw-safe centers/rings, rapid replacement, drag coalescing and reduced motion.');

{
 const h=harness(),wheel=h.element();wheel.wheel=true;
 h.fire('pointerdown',wheel,{clientX:400,clientY:450});h.flush();
 assert.equal(waves(h).length,0,'wheel stays stable while held');h.fire('pointerup',wheel,{clientX:400,clientY:450});h.flush();const w=waves(h);validate(w);assert.equal(w[0].property,'--atlas-scale-wheel','wheel background edits originate at the wheel');
}

{
 const h=harness(),b=h.element({'data-gradient-select':'3'});b.tag='button';
 h.fire('pointerover',b);h.fire('pointerdown',b);h.fire('pointerup',b);
 assert.equal(h.calls.length,0,'key selector excludes nested button hover and press scales');
 h.fire('click',b,{detail:1,clientX:400,clientY:200});h.flush();validate(waves(h));
}
{
 const h=harness(),wheel=h.element();wheel.wheel=true;
 h.fire('pointerdown',wheel);for(let i=0;i<8;i++){h.window.AtlasMotion.colorChanged({target:wheel,clientX:400+i,clientY:450});h.flush();}
 assert.equal(waves(h).length,0,'Model redraws during drag do not scale markers');h.fire('pointerup',wheel);h.window.AtlasMotion.colorChanged({target:wheel,type:'pointerup',clientX:408,clientY:450});h.flush();assert.equal(waves(h).length,4,'Release and final model update coalesce into one pulse');
 const other=harness(),w=other.element();w.wheel=true;other.fire('pointerdown',w);other.fire('blur',w);other.fire('pointerup',w);other.flush();assert.equal(waves(other).length,0,'Blur clears deferred feedback');
}
