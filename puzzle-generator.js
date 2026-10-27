(function(root){
'use strict';
const bank=typeof module!=='undefined'?require('./word-bank.js'):root.WordBank;
const VERSION='1.0.0', TOTAL=5000;
const DIRS=Object.freeze([[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]].map(Object.freeze));
const tiers=[{name:'Beginner',size:7,count:5},{name:'Easy',size:9,count:6},{name:'Medium',size:11,count:8},{name:'Hard',size:13,count:10},{name:'Expert',size:15,count:13}];
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function random(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function shuffle(items,r){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function tierFor(n){return n<=40?0:n<=120?1:n<=400?2:n<=1200?3:4;}
function levelInfo(id){if(!Number.isInteger(id)||id<1||id>TOTAL)throw new RangeError('Level must be 1–5000');return{id,category:Object.keys(bank)[(id-1)%20],...tiers[tierFor(id)]};}
function dateValid(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===s;}
function build(identity,category,tier){
 const seed=hash('WORD HUNT|'+VERSION+'|'+identity), cfg=tiers[tier];
 for(let attempt=0;attempt<=6;attempt++){
  const r=random(hash(seed+':'+attempt)); const size=cfg.size;
  const words=shuffle(bank[category].filter(w=>w.length>=3&&w.length<=size),r).slice(0,cfg.count).sort((a,b)=>b.length-a.length||a.localeCompare(b,'en'));
  const grid=Array.from({length:size},()=>Array(size).fill('')); const solutions=[];let failed=false;
  for(const word of words){
   let placed=false;
   // Last attempt uses separate randomized rows: a bounded, guaranteed fallback.
   const row=attempt===6?shuffle(Array.from({length:size},(_,i)=>i),random(seed^0x51f15e))[solutions.length]:0;
   for(let trial=0;trial<(attempt===6?1:400);trial++){
    const [dx,dy]=attempt===6?(r()<.5?[1,0]:[-1,0]):DIRS[Math.floor(r()*8)];
    const x=attempt===6?(dx===1?0:size-1):Math.floor(r()*size), y=attempt===6?row:Math.floor(r()*size);
    const cells=Array.from(word,(_,i)=>({x:x+dx*i,y:y+dy*i}));
    if(cells.some((c,i)=>c.x<0||c.y<0||c.x>=size||c.y>=size||(grid[c.y][c.x]&&grid[c.y][c.x]!==word[i])))continue;
    cells.forEach((c,i)=>grid[c.y][c.x]=word[i]);solutions.push({word,x,y,dx,dy,cells});placed=true;break;
   }
   if(!placed){failed=true;break;}
  }
  if(failed)continue;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!grid[y][x])grid[y][x]='ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(r()*26)];
  const p={id:identity,version:VERSION,seed,category,difficulty:cfg.name,size,grid,words:words.slice().sort(),solutions,diagnostics:{attempts:attempt+1,fallback:attempt===6,expectedWords:cfg.count}};
  p.fingerprint=fingerprint(p);return p;
 }
 throw new Error('Bounded generator failed');
}
function fingerprint(p){return p.size+'|'+p.grid.map(r=>r.join('')).join('/')+'|'+p.words.slice().sort().join(',');}
function generateLevel(id){const info=levelInfo(id);return build('L'+id,info.category,tierFor(id));}
function generateDaily(date){if(!dateValid(date))throw new RangeError('Invalid local date');const h=hash(VERSION+'|daily|'+date);return build('D'+date,Object.keys(bank)[h%20],2);}
const api={VERSION,TOTAL,DIRS,tiers,bank,hash,random,levelInfo,generateLevel,generateDaily,fingerprint,dateValid};root.PuzzleGenerator=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
