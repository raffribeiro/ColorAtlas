/* Offline UI localization. Dictionaries are embedded by the standalone builder.
   Only leaf text/accessible attributes change; IDs, values and authored data stay
   in their original language. Graph redraws never trigger a tree scan. */
(() => {
 'use strict';
 const root=document.getElementById('munsell-picker');
 if(!root||window.AtlasI18n)return;
 const packs=JSON.parse(document.getElementById('atlas-language-packs').textContent);
 const languages=[['en','English'],['pt-BR','Português (Brasil)'],['es','Español'],['fr','Français'],['de','Deutsch'],['it','Italiano'],['ja','日本語'],['ko','한국어'],['zh-CN','简体中文']];
 const original=new WeakMap(),attributes=new WeakMap();
 const excluded='script,style,svg,canvas,pre,code,textarea,.studio-brand,.atlas-lockup-mark,.studio-library button,#preview-layer-list button:not(.preview-layer-random),#preview-layer-list input,option[data-user-preset],#preview-preset-select,mark[data-doc-search-mark]';
 let locale='en',pending=false;
 const select=document.createElement('select');select.id='atlas-language';select.className='atlas-language';select.setAttribute('aria-label','Language');select.dataset.contextHelp='Choose the language of the editor, documentation, tutorial and contextual help.';
 for(const [value,name] of languages){const option=document.createElement('option');option.value=value;option.lang=value;option.textContent=name;select.append(option);}
 const nav=root.querySelector('.studio-workspace-nav');nav.append(select);
 const normalized=value=>value.replace(/…/g,'...').replace(/\s+/g,' ').trim().toLowerCase();
 const indexes=Object.fromEntries(Object.entries(packs).map(([code,pack])=>[code,new Map(Object.entries(pack).map(([key,value])=>[normalized(key),value]))]));
 const searchIndexes=Object.fromEntries(Object.entries(packs).map(([code,pack])=>{
  const index=new Map();for(const [key,value]of Object.entries(pack))if(key.length<70&&!/[{}.!?]/.test(key)){
   const label=normalized(value);if(!index.has(label))index.set(label,new Set());index.get(label).add(normalized(key));
  }return [code,index];
 }));
 const queryTermsCache=new Map();
 function searchTerms(query){
  const text=normalized(query),key=locale+':'+text;
  if(!queryTermsCache.has(key)){
   if(queryTermsCache.size>=64)queryTermsCache.delete(queryTermsCache.keys().next().value);
   queryTermsCache.set(key,[...new Set([text,...(searchIndexes[locale]?.get(text)||[])])]);
  }return queryTermsCache.get(key);
 }
 const escape=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const templates=Object.fromEntries(Object.entries(packs).map(([code,pack])=>[code,Object.entries(pack).filter(([key])=>/\{\d+\}/.test(key)&&/[a-zA-Z]{3}/.test(key)).sort((a,b)=>b[0].length-a[0].length).map(([key,value])=>{
  const ids=[];let cursor=0,pattern='';for(const m of key.matchAll(/\{(\d+)\}/g)){pattern+=escape(key.slice(cursor,m.index))+'(.*?)';ids.push(m[1]);cursor=m.index+m[0].length;}pattern+=escape(key.slice(cursor));
  return {key,value,ids,pattern:new RegExp('^'+pattern+'$','i')};
 })]));
 function t(source){
  if(locale==='en'){
   const favorite=source.match(/^(Adicionar|Remover) (.+) (?:aos|dos) favoritos$/);
   if(favorite)return favorite[1]==='Adicionar'?`Add ${favorite[2]} to Favorites`:`Remove ${favorite[2]} from Favorites`;
   return {'Favoritos':'Favorites','Nenhum favorito encontrado.':'No favorites found.','Clique na estrela de uma paleta para salvá-la aqui.':'Click a palette’s star to keep it here.'}[source]||source;
  }
  const direct=indexes[locale]?.get(normalized(source));if(direct)return direct;
  const releaseCredit=source.match(/^(.*?)( · v\d+\.\d+\.\d+)$/);if(releaseCredit)return t(releaseCredit[1])+releaseCredit[2];
  if(!/[A-Za-z]/.test(source))return source;
  const hueLabel=source.match(/^((?:\d+(?:\.\d+)?[A-Z]{1,2}|[A-Z]{1,2})\s*·\s*)(.+)$/);
  if(hueLabel)return hueLabel[1]+t(hueLabel[2]);
  const maximum=source.match(/^(\d+)(; available maximum) (\d+)$/);if(maximum)return maximum[1]+t(maximum[2])+' '+maximum[3];
  for(const template of templates[locale]||[]){
   const match=source.replace(/\s+/g,' ').trim().match(template.pattern);if(!match)continue;
   const semanticBindings=['Step {0} · {1}','{0} matching {1}'].includes(template.key)||template.key.includes('available chroma')||template.key.includes('· base');
   const values={};template.ids.forEach((id,i)=>{values[id]=semanticBindings?indexes[locale].get(normalized(match[i+1]))||match[i+1]:match[i+1];});
   const suffixSlots=[...template.key.matchAll(/(?:palette|favorite|Preview preset)\{(\d+)\}/g)].map(noun=>noun[1]);
   if(suffixSlots.some(id=>!['','s'].includes(values[id])))continue;
   const countSlots=suffixSlots.map(id=>String(Number(id)-1));
   if(countSlots.some(id=>!/^\d+$/.test(String(values[id]).trim())))continue;
   // The source formatter supplies English ''/'s' suffix slots. Keep numeric
   // bindings but use the target language's noun endings; never append Latin
   // plural suffixes to Japanese/Korean/Chinese labels.
   for(const noun of template.key.matchAll(/(palette|favorite|Preview preset)\{(\d+)\}/g)){
    const id=noun[2],plural=values[id]==='s',kind=noun[1];
    if(['ja','ko','zh-CN'].includes(locale))values[id]='';
    else if(locale==='de')values[id]=plural?(kind==='favorite'?'en':'n'):'';
    else if(locale==='it')values[id]=kind==='palette'?(plural?'e':'a'):(plural?'i':'o');
   }
   return template.value.replace(/\{(\d+)\}/g,(all,id)=>values[id]??all);
  }
  // Decorative separators are authored outside the preset count span.
  if(source.endsWith(' ·'))return t(source.slice(0,-2))+' ·';
  return source;
 }
 function translateText(node,graphic=false){
  if(!node.parentElement||!graphic&&node.parentElement.closest(excluded)||node.parentElement.closest('#atlas-language'))return;
  const saved=original.get(node);let source=saved?.source;
  // A renderer may reuse a node. Capture its new English text, never its old translation.
  if(source===undefined||node.nodeValue!==saved.last)source=node.nodeValue;
  const key=source.trim(),translated=t(key);
  const next=translated!==key?source.replace(key,translated):source;
  if(node.nodeValue!==next)node.nodeValue=next;
  original.set(node,{source,last:next});
 }
 function scan(scope){
  if(scope.nodeType===3){translateText(scope);return;}
  if(scope.nodeType!==1||scope.closest(excluded))return;
  const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest(excluded)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  while(walker.nextNode())translateText(walker.currentNode);
  for(const element of [scope,...scope.querySelectorAll('[placeholder],[aria-label],[aria-valuetext],[title]')]){
   if(element.closest(excluded)&&!element.matches('svg,canvas')||element.closest('#atlas-language'))continue;
   translateAttributes(element);
  }
 }
 function translateAttributes(element){
   const stored=attributes.get(element)||{};
   for(const name of ['placeholder','aria-label','aria-valuetext','title']){
    if(!element.hasAttribute(name))continue;
    const current=element.getAttribute(name),previous=stored[name];
    const source=previous&&current===previous.last?previous.source:current;
    const next=t(source);stored[name]={source,last:next};
    if(current!==next)element.setAttribute(name,next);
   }
   attributes.set(element,stored);
 }
 function setLocale(value,persist=true){
  if(!languages.some(([id])=>id===value))value='en';
  // Original strings and last rendered values are separate so switching back
  // to English restores the authored UI without rebuilding any controls.
  observer.disconnect();window.dispatchEvent(new Event('atlas:beforelocalechange'));locale=value;select.value=value;scan(root);
  for(const svg of root.querySelectorAll('svg'))translateGraphic(svg);
  select.setAttribute('aria-label',t('Language'));
  root.lang=value;document.documentElement.lang=value;
  for(const area of root.querySelectorAll('#atlas-documentation,#atlas-tour,#atlas-splash'))area.lang=value;
  window.AtlasContextHelp?.hide();
  window.dispatchEvent(new CustomEvent('atlas:localechange',{detail:{locale:value}}));
  scan(root);observe();
  if(persist)parent.postMessage({channel:'color-atlas-language',action:'write',locale:value},'*');
 }
 function sourceLabel(element){
  const stored=attributes.get(element);
  if(stored?.['aria-label'])return stored['aria-label'].source;
  const text=[...element.childNodes].map(n=>n.nodeType===3?(original.get(n)?.source??n.nodeValue):n.textContent).join('');
  return text.trim()||element.getAttribute('aria-label')||element.getAttribute('title')||'';
 }
 function translateGraphic(svg){if(!svg)return;translateAttributes(svg);for(const element of svg.querySelectorAll('text,title,desc'))for(const node of element.childNodes)if(node.nodeType===3)translateText(node,true);}
 const observer=new MutationObserver(records=>{
  const changed=new Set();
  for(const record of records){
   if(record.target.nodeType===1&&record.target.closest(excluded))continue;
   if(record.type==='attributes')changed.add(record.target);
   else if(record.type==='characterData'){if(record.target.parentElement?.closest(excluded))continue;changed.add(record.target);}
   else for(const node of record.addedNodes)if(node.nodeType===1&&!node.closest(excluded)||node.nodeType===3)changed.add(node);
  }
  if(!changed.size||pending)return;pending=true;
  queueMicrotask(()=>{pending=false;observer.disconnect();for(const node of changed)if(node.isConnected)scan(node);observe();});
 });
 function observe(){observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','aria-valuetext','placeholder']});}
 select.addEventListener('change',()=>setLocale(select.value));
 window.addEventListener('message',event=>{if(event.source===parent&&event.data?.channel==='color-atlas-language'&&event.data.action==='restore')setLocale(event.data.locale,false);});
 window.AtlasI18n=Object.freeze({t,setLocale,sourceLabel,translateGraphic,searchTerms,sourceText:node=>original.get(node)?.source??node.nodeValue,get locale(){return locale;},languages:languages.map(([id])=>id)});
 scan(root);observe();parent.postMessage({channel:'color-atlas-language',action:'read'},'*');
})();
