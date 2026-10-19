(()=>{
 const root=document.getElementById('munsell-picker'),splash=document.querySelector('#atlas-splash'),noise=document.querySelector('.splash-noise');
 const previous=document.activeElement,queued=[],pending=[];let timer=0,deadline=0,frame=0,finished=false,revealing=false;
 const start=()=>{
  if(window.AtlasStartup.ready)return;
  window.AtlasStartup.ready=true;for(const initialize of queued.splice(0))initialize();
 };
 window.AtlasStartup={ready:false,run(fn){if(this.ready)fn();else queued.push(fn);},waitFor(task){const safe=Promise.resolve(task).catch(()=>{});if(!finished)pending.push(safe);return safe;}};
 window.AtlasStartup.waitFor(document.fonts?.ready);
 const finish=()=>{
  if(finished)return;finished=true;clearTimeout(timer);clearTimeout(deadline);cancelAnimationFrame(frame);noise?.pauseAnimations?.();
  try{start();}
  finally{root?.removeAttribute('data-boot');if(splash)splash.hidden=true;previous?.focus({preventScroll:true});}
 };
 if(!splash||matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}
 root?.setAttribute('data-boot','loading');
 const close=()=>{
  if(finished||revealing)return;revealing=true;clearTimeout(timer);start();let settled=false;
  const settle=()=>{
   if(finished||settled)return;settled=true;clearTimeout(deadline);
   frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{frame=0;if(!finished)splash.close();});});
  };
  deadline=setTimeout(settle,1500);Promise.allSettled(pending).then(settle);
 };
 splash.addEventListener('close',finish);
 splash.addEventListener('cancel',e=>{e.preventDefault();close();});
 splash.addEventListener('click',e=>{if(e.target.closest('[data-splash-skip]'))close();});
 splash.hidden=false;
 try{splash.showModal();}catch{finish();return;}
 splash.querySelector('[data-splash-skip]').focus({preventScroll:true});
 const percent=splash.querySelector('[data-splash-percent]'),status=splash.querySelector('[data-splash-status]'),progress=splash.querySelector('.splash-progress'),fill=progress.querySelector('span');
 const pool=["Untangling the rainbows…","Teaching pixels some manners…","Convincing colors to get along…","Giving gray a day off…","Asking magenta to use its indoor voice…","Saving yellow a sunny seat…","Helping blue warm up…","Telling red to take a breath…","Getting the gradients in line…","Polishing the last pixel…","Checking the wheel for loose colors…","Giving the shadows a pep talk…","Turning the glow up to tasteful…","Asking the highlights to share…","Keeping cyan out of the coffee…","Finding the missing shade…","Making room for one more hue…","Putting the pixels on their best behavior…","Keeping the palette from starting a band…","Turning color drama into gradients…"];
 const count=3+Math.floor(Math.random()*4),steps=[];for(let i=0;i<count;i++)steps.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);let step=0;
 const advance=()=>{
  const phrase=steps[step++];status.textContent=phrase;if(step===steps.length)start();
  const value=step===steps.length?100:Math.round((step-1+.3+Math.random()*.4)/steps.length*100);percent.textContent=`${value}%`;
  progress.setAttribute('aria-valuenow',value);progress.setAttribute('aria-valuetext',phrase);
  fill.style.transform=`scaleX(${value/100})`;
  timer=setTimeout(step<steps.length?advance:close,220+Math.floor(Math.random()*201));
 };
 advance();
})();
