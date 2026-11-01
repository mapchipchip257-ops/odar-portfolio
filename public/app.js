const search=document.querySelector('#game-search'),cards=[...document.querySelectorAll('.game-card')];
search.addEventListener('input',()=>{let count=0;cards.forEach(c=>{c.hidden=!c.dataset.name.includes(search.value.trim().toLowerCase());if(!c.hidden)count++;});document.querySelector('#search-empty').hidden=count>0;});
const compact=new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}),full=new Intl.NumberFormat('en-US');
const badge=document.querySelector('.badge'),note=document.querySelector('.data-note'),refresh=document.querySelector('.refresh-stats');let busy=false,lastSuccess;
function value(el,n){el.textContent=n==null?'Unavailable':compact.format(n);el.title=n==null?'Temporarily unavailable':full.format(n);}
async function updateStats(){if(busy)return;busy=true;refresh.disabled=true;badge.textContent='UPDATING';try{const r=await fetch('/api/stats',{cache:'no-store'});if(!r.ok)throw Error();const data=await r.json();document.querySelectorAll('[data-total]').forEach(el=>value(el,data.totals[el.dataset.total]));for(const g of data.games){const c=cards.find(c=>c.dataset.name===g.name.toLowerCase());if(c)c.querySelectorAll('[data-stat]').forEach(el=>value(el,g[el.dataset.stat]));}const grid=document.querySelector('.game-grid');
const counts=new Map(data.games.map(g=>[g.name.toLowerCase(),g.playing]));
cards.sort((a,b)=>{const av=counts.get(a.dataset.name),bv=counts.get(b.dataset.name);return (bv??-1)-(av??-1)||a.dataset.name.localeCompare(b.dataset.name);});
for(const card of cards)grid.append(card);
lastSuccess=data.fetchedAt;badge.textContent=data.complete?'LIVE':'PARTIAL';note.textContent=`Updated ${new Date(lastSuccess).toLocaleTimeString()}. Auto-refreshes every minute.`;}catch{badge.textContent=lastSuccess?'STALE':'OFFLINE';note.textContent=lastSuccess?`Last updated ${new Date(lastSuccess).toLocaleTimeString()}. Retrying automatically.`:'Roblox is temporarily unavailable. Retrying automatically.';}finally{busy=false;refresh.disabled=false;}}
refresh.addEventListener('click',updateStats);updateStats();setInterval(()=>{if(!document.hidden)updateStats();},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateStats();});

const flightToggle=document.querySelector('.flight-toggle');flightToggle.addEventListener('click',()=>{const paused=document.body.classList.toggle('flight-paused');flightToggle.setAttribute('aria-pressed',String(paused));flightToggle.setAttribute('aria-label',paused?'Resume flying avatar':'Pause flying avatar');flightToggle.textContent=paused?'Resume mascot ▶':'Pause mascot ⏸';});

const studioPause=document.querySelector('.studio-pause');studioPause.addEventListener('click',()=>{const paused=document.querySelector('.studio-conveyor').classList.toggle('is-paused');studioPause.setAttribute('aria-pressed',String(paused));studioPause.textContent=paused?'Resume ▶':'Pause ⏸';studioPause.setAttribute('aria-label',paused?'Resume studio logos':'Pause studio logos');});
