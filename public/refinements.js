// Bring the chosen KOC card forward; the existing lightbox opens its full image.
document.querySelectorAll('[data-stack-card]').forEach(card=>{
  card.addEventListener('click',()=>{
    document.querySelectorAll('[data-stack-card]').forEach(item=>item.classList.toggle('is-front',item===card));
  });
});

// Native scroll containers remain swipeable and keyboard-accessible without autoplay.
// Motion pauses for user interaction, reduced-motion preferences, dialogs and hidden tabs.
(()=>{
  const gallery=document.querySelector('#poster-gallery');
  const toggle=document.querySelector('#poster-toggle');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=false,visible=false,last=0,frame=0;
  const rows=[...gallery.querySelectorAll('.poster-rail')].map(el=>({el,direction:Number(el.dataset.direction),position:0,holdUntil:0,hover:false,focus:false,pointer:false}));
  function updateButton(){const stopped=paused||reduced.matches;toggle.textContent=stopped?'播放滚动':'暂停滚动';toggle.setAttribute('aria-pressed',String(stopped));toggle.disabled=reduced.matches;if(reduced.matches)toggle.textContent='手动浏览';}
  function eligible(){return visible&&!document.hidden&&!paused&&!reduced.matches&&!imageDialog.open;}
  function requestFrame(){if(!frame&&eligible()){last=0;frame=requestAnimationFrame(tick);}}
  function tick(time){frame=0;if(!eligible())return;const delta=last?Math.min((time-last)/1000,.05):0;last=time;
    for(const row of rows){const max=row.el.scrollWidth-row.el.clientWidth;if(max<=0)continue;
      if(row.hover||row.focus||row.pointer||time<row.holdUntil){row.position=row.el.scrollLeft;continue;}
      row.position=Math.min(max,Math.max(0,row.position+row.direction*delta*22));row.el.scrollLeft=row.position;
      if(row.position>=max-1)row.direction=-1;else if(row.position<=0)row.direction=1;
    }
    frame=requestAnimationFrame(tick);
  }
  function hold(row){row.holdUntil=performance.now()+5000;row.position=row.el.scrollLeft;}
  rows.forEach(row=>{
    row.el.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')row.hover=true;});
    row.el.addEventListener('pointerleave',()=>{row.hover=false;});
    row.el.addEventListener('pointerdown',()=>{row.pointer=true;hold(row);});
    row.el.addEventListener('pointerup',()=>{row.pointer=false;hold(row);});
    row.el.addEventListener('pointercancel',()=>{row.pointer=false;hold(row);});
    row.el.addEventListener('wheel',()=>hold(row),{passive:true});
    row.el.addEventListener('touchmove',()=>hold(row),{passive:true});
    row.el.addEventListener('focusin',()=>{row.focus=true;});
    row.el.addEventListener('focusout',e=>{row.focus=row.el.contains(e.relatedTarget);});
    row.el.addEventListener('keydown',e=>{if(e.target!==row.el)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();row.el.scrollBy({left:e.key==='ArrowLeft'?-220:220,behavior:'smooth'});hold(row);}});
  });
  window.addEventListener('pointerup',()=>rows.forEach(row=>{if(row.pointer){row.pointer=false;hold(row);}}));
  // Give the second row its own starting point and direction without duplicating images.
  function initialize(){rows[1].el.scrollLeft=Math.min(470,rows[1].el.scrollWidth-rows[1].el.clientWidth);rows.forEach(row=>row.position=row.el.scrollLeft);}
  initialize();
  toggle.addEventListener('click',()=>{paused=!paused;updateButton();requestFrame();});
  document.querySelectorAll('[data-poster-step]').forEach(button=>button.addEventListener('click',()=>{rows.forEach(row=>{row.el.scrollBy({left:Number(button.dataset.posterStep)*300,behavior:reduced.matches?'auto':'smooth'});hold(row);});}));
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;requestFrame();},{rootMargin:'60px'}).observe(gallery);
  document.addEventListener('visibilitychange',requestFrame);
  imageDialog.addEventListener('close',requestFrame);
  reduced.addEventListener('change',()=>{updateButton();requestFrame();});
  updateButton();
})();
