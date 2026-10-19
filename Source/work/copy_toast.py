from pathlib import Path
import re
p=Path(re.search("const file='([^']+)'",Path('work/check_triad.cjs').read_text())[1]);s=p.read_text()
s=s.replace('<div id="munsell-picker">','<div id="munsell-picker">\n  <div class="mp-copy-toast" data-field="copy-toast" role="status" aria-live="polite" hidden>Copiado</div>',1)
s=s.replace('#munsell-picker{display:flex;', '#munsell-picker{position:relative;display:flex;')
s=s.replace('<style>','''<style>
#munsell-picker .mp-copy-toast{position:absolute;z-index:20;pointer-events:none;background:var(--popover);color:var(--popover-foreground);padding:6px 10px;border-radius:6px;box-shadow:0 2px 8px #0003;white-space:nowrap;transform:translate(-50%,-100%)}
''',1)
s=s.replace('copyCode(hex.toUpperCase());},true);', 'copyCode(hex.toUpperCase(),{x:e.clientX,y:e.clientY,target});},true);')
a=s.index('async function copyCode(text)');b=s.index("$('[data-action=\"copy\"]')",a)
s=s[:a]+'''let copyToastTimer;
function showCopied(anchor){
 if(!anchor)return;
 const toast=field('copy-toast'),box=root.getBoundingClientRect(),targetBox=anchor.target.getBoundingClientRect();
 const x=Number.isFinite(anchor.x)&&anchor.x>0?anchor.x:targetBox.left+targetBox.width/2;
 const y=Number.isFinite(anchor.y)&&anchor.y>0?anchor.y:targetBox.top;
 toast.hidden=false;toast.style.left=`${Math.max(40,Math.min(box.width-40,x-box.left))}px`;toast.style.top=`${Math.max(32,y-box.top-12)}px`;
 clearTimeout(copyToastTimer);copyToastTimer=setTimeout(()=>{toast.hidden=true},1100);
}
async function copyCode(text,anchor){
 let copied=false;
 try{await navigator.clipboard.writeText(text);copied=true;}catch{
  const f=field('copy-fallback');f.value=text;f.parentElement.hidden=false;f.select();
  try{copied=document.execCommand('copy')}catch{}
  if(copied)f.parentElement.hidden=true;
 }
 field('copy-status').textContent=copied?'Copiado':'Selecione e copie o código';
 if(copied)showCopied(anchor);
}
''' +s[b:]
p.write_text(s)
# Add geometry/timer support to focused logic harness.
q=Path('work/check_triad.cjs');t=q.read_text().replace('const root={querySelector:node,','const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,').replace('const context={document:', 'const context={setTimeout(){return 1},clearTimeout(){},document:')
t=t.replace("return {getAttribute(){return ''},textContent:'#00a15e ×'}", "return {getBoundingClientRect(){return {left:50,top:100,width:80}},getAttribute(){return ''},textContent:'#00a15e ×'}")
q.write_text(t)
