const search=document.querySelector('#game-search'),cards=[...document.querySelectorAll('.game-card')];
const morePanel=document.querySelector('.more-games-panel');
search.addEventListener('input',()=>{let count=0;const query=search.value.trim().toLowerCase();cards.forEach(c=>{c.hidden=!c.dataset.name.includes(query);if(!c.hidden)count++;});morePanel.hidden=!morePanel.dataset.name.includes(query);if(!morePanel.hidden)count++;document.querySelector('#search-empty').hidden=count>0;});
const compact=new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}),full=new Intl.NumberFormat('en-US');
const badge=document.querySelector('.badge'),note=document.querySelector('.data-note'),refresh=document.querySelector('.refresh-stats');let busy=false,lastSuccess;
function value(el,n){el.textContent=n==null?'Unavailable':(el.dataset.total==='playing'||el.dataset.stat==='playing'||el.dataset.more==='playing'?full:compact).format(n);el.title=n==null?'Temporarily unavailable':full.format(n);}
async function updateStats(){if(busy)return;busy=true;refresh.disabled=true;badge.textContent='UPDATING';try{const r=await fetch('/api/stats',{cache:'no-store'});if(!r.ok)throw Error();const data=await r.json();document.querySelectorAll('[data-total]').forEach(el=>value(el,data.totals[el.dataset.total]));for(const g of data.games){const c=cards.find(c=>c.dataset.name===g.name.toLowerCase());if(c)c.querySelectorAll('[data-stat]').forEach(el=>value(el,g[el.dataset.stat]));}const grid=document.querySelector('.game-grid');
const counts=new Map(data.games.map(g=>[g.name.toLowerCase(),g.playing]));
cards.sort((a,b)=>{const av=counts.get(a.dataset.name),bv=counts.get(b.dataset.name);return (bv??-1)-(av??-1)||a.dataset.name.localeCompare(b.dataset.name);});
for(const card of cards)grid.append(card);
grid.append(morePanel);
morePanel.querySelectorAll('[data-more]').forEach(el=>value(el,data.additional?.[el.dataset.more]));
lastSuccess=data.fetchedAt;badge.textContent=data.complete?'LIVE':'PARTIAL';note.textContent=`Updated ${new Date(lastSuccess).toLocaleTimeString()}. Auto-refreshes every minute.`;}catch{badge.textContent=lastSuccess?'STALE':'OFFLINE';note.textContent=lastSuccess?`Last updated ${new Date(lastSuccess).toLocaleTimeString()}. Retrying automatically.`:'Roblox is temporarily unavailable. Retrying automatically.';}finally{busy=false;refresh.disabled=false;}}
refresh.addEventListener('click',updateStats);updateStats();setInterval(()=>{if(!document.hidden)updateStats();},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateStats();});



// Counts page loads; the id prevents retries from counting the same load twice.
const visitsBox=document.querySelector('.site-visit-counter');
const pageviewId=crypto.randomUUID();let visitRecorded=false,visitBusy=false;
async function updateVisits(){if(visitBusy)return;visitBusy=true;try{const r=await fetch('/api/visits',visitRecorded?{cache:'no-store'}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pageviewId}),cache:'no-store'});if(!r.ok)throw Error();const data=await r.json();if(!Number.isSafeInteger(data.visits)||data.visits<0)throw Error();visitRecorded=true;document.querySelector('#site-visits').textContent=full.format(data.visits);visitsBox.hidden=false;}catch{if(!visitRecorded)visitsBox.hidden=true;}finally{visitBusy=false;}}
updateVisits();setInterval(()=>{if(!document.hidden)updateVisits();},60000);

const previewPause=document.querySelector('.showcase-pause');previewPause.addEventListener('click',()=>{const paused=document.querySelector('.reel').classList.toggle('is-paused');previewPause.setAttribute('aria-pressed',String(paused));previewPause.textContent=paused?'Resume previews':'Pause previews';});

const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
function snow(canvas){
  const ctx=canvas.getContext("2d");let W=0,H=0,flakes=[],run=false,last=0;
  const mk=top=>({x:Math.random()*W,y:top?Math.random()*H:-8,r:.7+Math.pow(Math.random(),2)*3.2,ph:Math.random()*6.28});
  function size(){
    const r=canvas.parentElement.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
    W=r.width;H=r.height;canvas.width=W*d;canvas.height=H*d;ctx.setTransform(d,0,0,d,0,0);
    const n=Math.max(40,Math.min(170,Math.round(W*H/9000)));
    flakes=Array.from({length:n},()=>mk(true));draw();
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    for(const f of flakes){ctx.globalAlpha=.35+f.r/5.2*.6;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,6.283);ctx.fillStyle="#fff";ctx.fill()}
    ctx.globalAlpha=1;
  }
  function loop(t){
    if(!run)return;
    const dt=Math.min(t-last,50)/1000;last=t;
    for(const f of flakes){
      f.y+=(18+f.r*13)*dt;f.x+=Math.sin(t*.0006+f.ph)*14*dt;
      if(f.y>H+6){Object.assign(f,mk(false));}
      if(f.x<-6)f.x=W+6;else if(f.x>W+6)f.x=-6;
    }
    draw();requestAnimationFrame(loop);
  }
  size();addEventListener("resize",size);
  if(reduce)return;
  new IntersectionObserver(es=>{const on=es[0].isIntersecting;if(on&&!run){run=true;last=performance.now();requestAnimationFrame(loop)}else if(!on)run=false}).observe(canvas.parentElement);
}
document.querySelectorAll("canvas.snow").forEach(snow);

