/* Independent checks: deliberately do not rely on placement helpers. */
(function(root){'use strict';
function validate(p){const errors=[];const fail=s=>errors.push(s);
 if(!p||!Number.isInteger(p.size)||p.size<7||p.size>15)return{valid:false,errors:['Invalid dimensions']};
 const n=p.size;if(!Array.isArray(p.grid)||p.grid.length!==n||p.grid.some(r=>!Array.isArray(r)||r.length!==n||r.some(c=>!(/^[A-Z]$/).test(c))))return{valid:false,errors:['Invalid grid']};
 const counts={Beginner:5,Easy:6,Medium:8,Hard:10,Expert:13};
 if(p.words.length!==counts[p.difficulty]||new Set(p.words).size!==p.words.length)fail('Invalid target count');
 if(p.solutions.length!==p.words.length)fail('Missing solutions');const claimed=new Map(),seen=new Set();
 for(const s of p.solutions){
  if(!p.words.includes(s.word)||seen.has(s.word)||!(/^[A-Z]{3,15}$/).test(s.word))fail('Invalid or repeated word');seen.add(s.word);
  if(![s.x,s.y,s.dx,s.dy].every(Number.isInteger)||Math.abs(s.dx)>1||Math.abs(s.dy)>1||(!s.dx&&!s.dy)){fail('Invalid direction');continue;}
  if(s.cells.length!==s.word.length)fail('Path length');
  s.cells.forEach((c,i)=>{if(c.x!==s.x+s.dx*i||c.y!==s.y+s.dy*i)fail('Path not straight');if(c.x<0||c.y<0||c.x>=n||c.y>=n){fail('Out of bounds');return;}
   if(p.grid[c.y][c.x]!==s.word[i])fail('Word does not match grid');const key=c.y*n+c.x;if(claimed.has(key)&&claimed.get(key)!==s.word[i])fail('Conflicting overlap');claimed.set(key,s.word[i]);});
 }
 if(p.words.some(w=>!seen.has(w)))fail('Target missing');
 if(!p.diagnostics||p.diagnostics.attempts<1||p.diagnostics.attempts>7)fail('Unbounded retry metadata');
 return{valid:errors.length===0,errors,checkedWords:seen.size,occupiedCells:claimed.size};
}
root.PuzzleValidator={validate};if(typeof module!=='undefined')module.exports=root.PuzzleValidator;
})(globalThis);
