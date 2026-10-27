(function(root){'use strict';
const G=typeof module!=='undefined'?require('./puzzle-generator.js'):root.PuzzleGenerator;
const KEY='word-hunt.save.v1', MAX=5000;
const integer=(n,def=0,max=1e9)=>Number.isFinite(n)&&n>=0?Math.min(max,Math.floor(n)):def;
const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
function defaults(){return{schema:1,generator:G.VERSION,current:1,unlocked:1,completed:{},daily:{},sessions:{},coins:25,totalScore:0,settings:{timer:true,motion:false}};}
function normalize(raw){const s=defaults();if(!object(raw)||raw.schema!==1||raw.generator!==G.VERSION)return s;
 s.current=Math.max(1,integer(raw.current,1,MAX));s.unlocked=Math.max(1,integer(raw.unlocked,1,MAX));s.current=Math.min(s.current,s.unlocked);
 s.coins=integer(raw.coins,25);s.totalScore=integer(raw.totalScore);
 for(const field of ['completed','daily'])if(object(raw[field]))for(const [k,v]of Object.entries(raw[field])){
  if(!object(v)||(field==='completed'?!/^[1-9]\d*$/.test(k)||+k>MAX:!G.dateValid(k)))continue;
  s[field][k]={score:integer(v.score),time:integer(v.time),hints:integer(v.hints),stars:Math.max(1,integer(v.stars,1,3))};
 }
 if(object(raw.settings))for(const k of ['timer','motion'])if(typeof raw.settings[k]==='boolean')s.settings[k]=raw.settings[k];
 if(object(raw.sessions))for(const [k,v]of Object.entries(raw.sessions).slice(-30)){
  if(!object(v)||!(/^L[1-9]\d*$/.test(k)&&+k.slice(1)<=s.unlocked||k.startsWith('D')&&G.dateValid(k.slice(1))))continue;
  const paths={};if(object(v.paths))for(const [word,path]of Object.entries(v.paths)){if(/^[A-Z]{3,15}$/.test(word)&&Array.isArray(path)&&path.length===word.length&&path.every(i=>Number.isInteger(i)&&i>=0&&i<225))paths[word]=path;}
  s.sessions[k]={paths,elapsed:integer(v.elapsed,0,86400000),hints:integer(v.hints,0,100000)};
 }
 return s;
}
function load(storage){try{return{state:normalize(JSON.parse(storage.getItem(KEY))),available:true};}catch(e){return{state:defaults(),available:false};}}
function save(storage,s){try{storage.setItem(KEY,JSON.stringify(s));return true;}catch(e){return false;}}
function localDate(date=new Date()){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');}
function dayNumber(date){return Math.floor(Date.parse(date+'T12:00:00Z')/86400000);}
function streaks(history,today=localDate()){
 const days=[...new Set(Object.keys(history).filter(G.dateValid).map(dayNumber))].sort((a,b)=>a-b),set=new Set(days);let best=0,run=0,prev=-Infinity;
 for(const d of days){run=d===prev+1?run+1:1;best=Math.max(best,run);prev=d;}
 let d=dayNumber(today),current=0;if(!set.has(d))d--;while(set.has(d)){current++;d--;}return{current,best};
}
function pathBetween(a,b,n){if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>=n*n||b>=n*n)return[];const x=a%n,y=Math.floor(a/n),dx=b%n-x,dy=Math.floor(b/n)-y;if(dx&&dy&&Math.abs(dx)!==Math.abs(dy))return[];const len=Math.max(Math.abs(dx),Math.abs(dy));return Array.from({length:len+1},(_,i)=>(y+Math.sign(dy)*i)*n+x+Math.sign(dx)*i);}
function match(p,path,found={}){
 if(!Array.isArray(path)||path.length<3||path.some(i=>!Number.isInteger(i)||i<0||i>=p.size*p.size))return null;
 const expected=pathBetween(path[0],path[path.length-1],p.size);if(expected.length!==path.length||expected.some((x,i)=>x!==path[i]))return null;
 const text=path.map(i=>p.grid[Math.floor(i/p.size)][i%p.size]).join(''),reverse=[...text].reverse().join('');return p.words.find(w=>!Object.hasOwn(found,w)&&(w===text||w===reverse))||null;
}
function restoreSession(p,raw){const session={paths:{},elapsed:integer(raw?.elapsed,0,86400000),hints:integer(raw?.hints,0,100000)};if(object(raw?.paths))for(const [w,path]of Object.entries(raw.paths))if(match(p,path)===w)session.paths[w]=path.slice();return session;}
function score(p,s){return Math.max(100,p.words.length*100+Math.max(0,600-Math.floor(s.elapsed/1000)*2)-s.hints*80);}
function rating(s){return s.hints===0?3:s.hints<=2?2:1;}
function hint(s,session,p,type,r=Math.random){const cost=type==='start'?3:1;if(s.coins<cost)return null;const remaining=p.solutions.filter(x=>!session.paths[x.word]);if(!remaining.length)return null;const sol=remaining[Math.floor(r()*remaining.length)];const c=sol.cells[type==='start'?0:Math.floor(r()*sol.cells.length)];s.coins-=cost;session.hints++;return{cell:c.y*p.size+c.x,word:sol.word,cost};}
function complete(s,p,session){if(p.words.some(w=>!session.paths[w]))throw new Error('Incomplete puzzle');const daily=p.id.startsWith('D'),key=p.id.slice(1),book=daily?s.daily:s.completed,prior=book[key];const result={score:score(p,session),time:session.elapsed,hints:session.hints,stars:rating(session)};
 let reward=0;
 if(!prior){book[key]=result;reward=20+(session.hints===0?10:0);if(daily){reward+=30;const streak=streaks(s.daily,key).current;reward+=Math.min(streak,7)*2;}s.coins+=reward;s.totalScore+=result.score;}
 else book[key]={score:Math.max(prior.score,result.score),time:Math.min(prior.time,result.time),hints:Math.min(prior.hints,result.hints),stars:Math.max(prior.stars,result.stars)};
 if(!daily){s.unlocked=Math.max(s.unlocked,Math.min(MAX,Number(key)+1));s.current=Math.max(s.current,Math.min(MAX,Number(key)+1));}delete s.sessions[p.id];return{...result,reward,first:!prior};
}
const api={KEY,defaults,normalize,load,save,localDate,streaks,pathBetween,match,restoreSession,score,rating,hint,complete};root.WordHuntCore=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
