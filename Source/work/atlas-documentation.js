(() => {
 const root=document.getElementById('munsell-picker');
 if(!root)return;
 const panel=root.querySelector('#atlas-documentation');
 if(!panel)return;
 const tabs=[...root.querySelectorAll('[data-studio-view]')],topics=[...panel.querySelectorAll('[data-doc-topic]')],links=[...panel.querySelectorAll('[data-doc-link]')];
 const search=panel.querySelector('#atlas-doc-search'),results=panel.querySelector('#atlas-doc-results'),reader=panel.querySelector('.atlas-docs-reading');
 const previous=panel.querySelector('[data-doc-previous]'),next=panel.querySelector('[data-doc-next]');
 const chapterNav=panel.querySelector('.atlas-docs-sidebar nav');
 // Build this index once from authored content, not the changing example readouts.
 const cleanText=node=>{
  const copy=node.cloneNode(true);
  copy.querySelectorAll('script,style,svg,canvas,.doc-ex-readout,.doc-ex-controls,.doc-ex-actions,.doc-ex-objective,.doc-ex-goal,.atlas-docs-section-index').forEach(n=>n.remove());
  return copy.textContent.replace(/\s+/g,' ').trim();
 };
 const indexSections=()=>topics.flatMap(topic=>{
  const chapter=topic.querySelector('h1').textContent.trim(),topicId=topic.dataset.docTopic;
  const headings=[...topic.children].filter(node=>/^H[12]$/.test(node.tagName));
  return headings.map((heading,index)=>{
   if(!heading.id)heading.id=`doc-${topicId}-section-${index}`;
   heading.tabIndex=-1;heading.dataset.docSection=heading.id;
   const fragments=[];
   for(let node=heading.nextElementSibling;node&&!/^H[12]$/.test(node.tagName);node=node.nextElementSibling)fragments.push(cleanText(node));
   return {topic,topicId,chapter,heading,title:heading.textContent.trim(),body:fragments.join(' ')};
  });
 });
 let sections=indexSections();
 const matches=document.createElement('nav');matches.className='atlas-docs-search-matches';matches.setAttribute('aria-label','Matching documentation sections');matches.hidden=true;chapterNav.after(matches);
 const sectionIndex=document.createElement('nav');sectionIndex.className='atlas-docs-section-index';sectionIndex.setAttribute('aria-label','On this page');
 // Store scroll only for actual reading views. Hidden panels report zero geometry.
 const positions=new Map();let current=topics[0]?.dataset.docTopic;
 function remember(){if(root.dataset.view==='documentation')positions.set(current,reader.scrollTop);}
 function pagination(){const index=topics.findIndex(topic=>topic.dataset.docTopic===current);previous.disabled=index<=0;next.disabled=index<0||index>=topics.length-1;}
 function selectTopic(id,focus=false){
  const selected=topics.find(topic=>topic.dataset.docTopic===id);if(!selected)return;
  remember();current=id;
  for(const topic of topics)topic.hidden=topic!==selected;
  for(const link of links)link.setAttribute('aria-current',link.dataset.docLink===id?'page':'false');
  sectionIndex.replaceChildren();
  const label=document.createElement('span');label.textContent='On this page';sectionIndex.append(label);
  for(const section of sections.filter(s=>s.topicId===id&&s.heading.tagName==='H2')){
   const link=document.createElement('a');link.href='#'+section.heading.id;link.dataset.docSectionLink=section.heading.id;link.textContent=section.title;
   link.addEventListener('click',event=>{event.preventDefault();jump(section);});sectionIndex.append(link);
  }
  sectionIndex.hidden=sectionIndex.children.length<2;selected.querySelector('h1').after(sectionIndex);
  pagination();reader.scrollTop=positions.get(id)||0;
  if(focus)selected.querySelector('h1')?.focus({preventScroll:true});
 }
 function openView(view){
  if(view==='editor')remember();
  root.dataset.view=view;panel.hidden=view!=='documentation';
  for(const tab of tabs)tab.setAttribute('aria-pressed',String(tab.dataset.studioView===view));
  if(view==='editor')requestAnimationFrame(()=>window.dispatchEvent?.(new Event('resize')));
  else reader.scrollTop=positions.get(current)||0;
 }
 function jump(section){
  selectTopic(section.topicId);openView('documentation');
  // Only the reader scrolls; scrollIntoView would also move the host iframe/page.
  for(let ancestor=section.heading.parentElement;ancestor&&ancestor!==section.topic;ancestor=ancestor.parentElement)if(ancestor.tagName==='DETAILS')ancestor.open=true;
  // A matching formula may live in a collapsed disclosure under this section.
  section.topic.querySelectorAll('mark[data-doc-search-mark]').forEach(mark=>{
   for(let parent=mark.parentElement;parent&&parent!==section.topic;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
  });
  reader.scrollTop+=section.heading.getBoundingClientRect().top-reader.getBoundingClientRect().top-20;
  positions.set(current,reader.scrollTop);section.heading.focus({preventScroll:true});
 }
 function markedText(container,text,term){
  const lower=text.toLowerCase();let cursor=0,index=lower.indexOf(term);
  while(index!==-1){container.append(document.createTextNode(text.slice(cursor,index)));const mark=document.createElement('mark');mark.textContent=text.slice(index,index+term.length);container.append(mark);cursor=index+term.length;index=lower.indexOf(term,cursor);}
  container.append(document.createTextNode(text.slice(cursor)));
 }
 let highlightRecords=[];
 function highlight(term){
  // Keep the original Text objects: the locale layer owns their source strings.
  // Rejoining into new nodes loses that identity when switching languages.
  for(const {parent,node,parts} of highlightRecords){
   const first=parts.find(part=>part.parentNode===parent);if(first)parent.insertBefore(node,first);
   for(const part of parts)if(part.parentNode===parent)part.remove();
  }
  highlightRecords=[];
  if(!term)return;
  for(const topic of topics){
   const walker=document.createTreeWalker(topic,NodeFilter.SHOW_TEXT,{acceptNode:node=>node.parentElement.closest('script,style,svg,canvas,button,input,select,output,textarea,mark,.doc-ex-readout,.doc-ex-controls,.atlas-docs-section-index')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
   // Normalize a readable text stream while retaining original node offsets.
   // One phrase can cross <strong>/<a> boundaries; wrap fragments in place so
   // markup, controls and their listeners are preserved.
   const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
   let text='',lastBlock=null;const offsets=[];
   for(const node of nodes){
    const block=node.parentElement.closest('p,li,h1,h2,h3,td,th,pre,figcaption');
    if(lastBlock&&block!==lastBlock&&text&&!text.endsWith(' ')){text+=' ';offsets.push(null);}
    lastBlock=block;
    for(let i=0;i<node.textContent.length;i++){
     const char=node.textContent[i];
     if(/\s/.test(char)){if(!text.endsWith(' ')){text+=' ';offsets.push({node,offset:i});}}
     else{text+=char.toLowerCase();offsets.push({node,offset:i});}
    }
   }
   const ranges=new Map();let at=text.indexOf(term);
   while(at!==-1){
    for(let i=at;i<at+term.length;i++){
     const point=offsets[i];if(!point)continue;
     if(!ranges.has(point.node))ranges.set(point.node,[]);
     const list=ranges.get(point.node),last=list.at(-1);
     if(last&&point.offset<=last[1])last[1]=Math.max(last[1],point.offset+1);
     else list.push([point.offset,point.offset+1]);
    }
    at=text.indexOf(term,at+term.length);
   }
   for(const [node,list] of ranges){
    const fragment=document.createDocumentFragment();let cursor=0;
    for(const [start,end] of list){
     fragment.append(document.createTextNode(node.textContent.slice(cursor,start)));
     const mark=document.createElement('mark');mark.dataset.docSearchMark='';mark.textContent=node.textContent.slice(start,end);fragment.append(mark);cursor=end;
    }
    fragment.append(document.createTextNode(node.textContent.slice(cursor)));
    const parent=node.parentNode,parts=[...fragment.childNodes];node.replaceWith(fragment);highlightRecords.push({parent,node,parts});
   }
  }
 }
 function searchGuide(){
  const term=search.value.trim().replace(/\s+/g,' ').toLowerCase();matches.replaceChildren();matches.hidden=!term;chapterNav.hidden=!!term;
  const found=term?sections.filter(s=>(s.chapter+' '+s.title+' '+s.body).toLowerCase().includes(term)):[];
  results.textContent=term?(found.length?`${found.length} matching ${found.length===1?'section':'sections'}`:'No matching sections'):`${topics.length} topics`;
  for(const section of found){
   const button=document.createElement('button');button.type='button';button.className='atlas-docs-search-hit';
   const chapter=document.createElement('span');chapter.className='atlas-docs-hit-chapter';markedText(chapter,section.chapter,term);
   const title=document.createElement('strong');markedText(title,section.title,term);
   const snippet=document.createElement('span');snippet.className='atlas-docs-hit-snippet';
   const at=section.body.toLowerCase().indexOf(term),start=Math.max(0,at-45),end=Math.min(section.body.length,start+165);
   markedText(snippet,(start?'…':'')+section.body.slice(start,end)+(end<section.body.length?'…':''),term);
   button.append(chapter,title,snippet);button.addEventListener('click',()=>jump(section));matches.append(button);
  }
  if(term&&!found.length){const hint=document.createElement('p');hint.textContent='Try a control name such as Normalize or an engine name.';matches.append(hint);}
  highlight(term);
 }
 for(const tab of tabs)tab.addEventListener('click',()=>openView(tab.dataset.studioView));
 for(const link of links)link.addEventListener('click',event=>{event.preventDefault();selectTopic(link.dataset.docLink,true);});
 search.addEventListener('input',searchGuide);
 search.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();search.value='';searchGuide();}else if(event.key==='ArrowDown'&&search.value.trim()){event.preventDefault();matches.querySelector('button')?.focus();}});
 reader.addEventListener('scroll',remember,{passive:true});
 window.addEventListener('atlas:beforelocalechange',()=>highlight(''));
 window.addEventListener('atlas:localechange',()=>{
  const top=reader.scrollTop;sections=indexSections();selectTopic(current);searchGuide();reader.scrollTop=top;
 });
 for(const [button,offset] of [[previous,-1],[next,1]])button.addEventListener('click',()=>{const index=topics.findIndex(topic=>topic.dataset.docTopic===current),target=topics[index+offset];if(target)selectTopic(target.dataset.docTopic,true);});
 // Small public bridge for contextual help; it never touches authored editor state.
 window.AtlasDocumentation={open(topicId,sectionId){
  search.value='';searchGuide();
  const section=sections.find(s=>s.topicId===topicId&&(s.heading.id===sectionId||s.title.toLowerCase()===String(sectionId||'').toLowerCase()));
  if(section)jump(section);else{selectTopic(topicId);openView('documentation');topics.find(t=>t.dataset.docTopic===topicId)?.querySelector('h1')?.focus({preventScroll:true});}
 }};
 results.textContent=topics.length+' topics';selectTopic(current);openView('editor');
})();
