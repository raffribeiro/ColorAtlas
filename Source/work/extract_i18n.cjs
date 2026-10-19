/* Extract source-owned English copy; mathematical/code tokens remain unchanged. */
const fs=require('fs'),acorn=require('/Users/raffribeiro/Documents/Codex/RPG_Narrator/narrative-engine/node_modules/acorn');
const htmlDecode=s=>s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&#x27;/g,"'").replace(/&nbsp;/g,' ');
const result=new Set();
function add(s){s=htmlDecode(s).replace(/\s+/g,' ').trim();if(!s||s.length>1800||!/[A-Za-z]{2}/.test(s)||/^https?:|^data:|^file:/.test(s))return;
 if(/^[.#\["<]|^:scope|^\(min-|^\(prefers-|=>|querySelector|function\(|var\(|!important|\{[a-z-]+:|\/\//.test(s))return;
 if(!/\s/.test(s)&&!/^[A-Z][a-zA-Z-]+$/.test(s))return;
 result.add(s);
}
function markup(s){s=s.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<pre\b[\s\S]*?<\/pre>|<code\b[\s\S]*?<\/code>/gi,'<i18n-skip/>');for(const text of s.split(/<[^>]*>/))add(text);for(const m of s.matchAll(/(?:title|aria-label|placeholder|alt)=["']([^"']+)["']/g))add(m[1]);}
function literal(s){if(s.includes('<'))markup(s);else add(s);}
function js(s){let ast;try{ast=acorn.parse(s,{ecmaVersion:'latest',sourceType:'script'})}catch{return;}
 function walk(n){if(!n||typeof n!=='object')return;if(n.type==='Property'&&['name','description','searchAliases','id','originalCategory','source','url','hex'].includes(n.key?.name||n.key?.value))return;if(n.type==='Literal'&&typeof n.value==='string')literal(n.value);if(n.type==='TemplateLiteral'){let str=n.quasis.map((q,i)=>q.value.cooked+(i<n.expressions.length?'{'+i+'}':'')).join('');literal(str);}
 for(const [k,v]of Object.entries(n))if(k!=='start'&&k!=='end'&&k!=='type'){if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}
 walk(ast);
}
const core=fs.readFileSync('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
markup(core);markup(fs.readFileSync('work/atlas-documentation.html','utf8'));
for(const f of ['atlas-context-help.js','atlas-documentation.js','atlas-documentation-examples.js','atlas-onboarding.js','atlas-library-io.js','atlas-gradient-editing.js','atlas-history-ui.js','atlas-graphic-design.js','atlas-preview-export.js'])js(fs.readFileSync('work/'+f,'utf8'));
['Choose the language of the editor, documentation, tutorial and contextual help.','Step {0} of 3','Step {0} complete','You finished {0}.','No matching sections. Try a different term.','Language','Documentation','Tutorial','Signal','Hue','Value','Chroma','Lightness','Black','White','Red','Green','Blue','Yellow'].forEach(add);
const existing=JSON.parse(fs.readFileSync('work/locales/en.json'));Object.keys(existing).forEach(k=>result.delete(k));
const sorted=[...result].sort();fs.writeFileSync(process.env.ATLAS_CORPUS_OUT||'work/locales/full/en.json',JSON.stringify(Object.fromEntries(sorted.map(k=>[k,k])),null,2)+'\n');
console.log(sorted.length,'strings;',sorted.join(' ').split(/\s+/).length,'words');
