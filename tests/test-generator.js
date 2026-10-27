'use strict';
/* Run from anywhere: node tests/test-generator.js. No packages needed. */
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');const{performance}=require('node:perf_hooks');
const G=require('../puzzle-generator.js'),V=require('../validator.js'),C=require('../core.js');
const start=performance.now(),fingerprints=new Map(),directions=new Set(),duplicates=[],tiers={},categories={};let validated=0,maxAttempts=0,fallbacks=0,overlapping=0;
for(const [category,words]of Object.entries(G.bank)){assert.ok(words.length>=50,category+' needs substantial vocabulary');assert.equal(new Set(words).size,words.length);assert.ok(words.every(w=>/^[A-Z]{2,15}$/.test(w)));}
for(let id=1;id<=5000;id++){
 const p=G.generateLevel(id),check=V.validate(p);assert.ok(check.valid,`Level ${id}: ${check.errors.join(', ')}`);validated++;
 assert.equal(p.id,'L'+id);assert.equal(p.version,G.VERSION);assert.equal(p.fingerprint,G.fingerprint(p));
 assert.deepEqual(G.generateLevel(id),p,'Determinism '+id);
 assert.equal(p.size,G.levelInfo(id).size);assert.equal(p.words.length,G.levelInfo(id).count);
 for(const sol of p.solutions){directions.add(sol.dx+','+sol.dy);const cells=sol.cells.map(c=>c.y*p.size+c.x);assert.equal(C.match(p,cells),sol.word);assert.equal(C.match(p,cells.slice().reverse()),sol.word);assert.equal(C.match(p,cells,{[sol.word]:cells}),null);}
 if(check.occupiedCells<p.words.reduce((sum,w)=>sum+w.length,0))overlapping++;
 const fp=crypto.createHash('sha256').update(p.fingerprint).digest('hex');if(fingerprints.has(fp))duplicates.push([fingerprints.get(fp),id]);else fingerprints.set(fp,id);
 maxAttempts=Math.max(maxAttempts,p.diagnostics.attempts);if(p.diagnostics.fallback)fallbacks++;tiers[p.difficulty]=(tiers[p.difficulty]||0)+1;categories[p.category]=(categories[p.category]||0)+1;
}
assert.equal(duplicates.length,0);assert.equal(fingerprints.size,5000);assert.equal(directions.size,8);
const puzzleMs=performance.now()-start;
const dailyFP=new Set();for(let i=0;i<366;i++){const date=new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10),p=G.generateDaily(date);assert.ok(V.validate(p).valid);assert.deepEqual(G.generateDaily(date),p);dailyFP.add(p.fingerprint);}assert.equal(dailyFP.size,366);
assert.throws(()=>G.generateDaily('2026-02-30'));assert.throws(()=>G.generateLevel(0));assert.throws(()=>G.generateLevel(5001));
// Deliberate damage must be caught by the independent validator.
for(const damage of [p=>p.grid[0][0]='?',p=>p.solutions[0].cells[0].x=-1,p=>p.words.push('MISSING'),p=>p.solutions[0].dx=2,p=>p.solutions.pop()]){const p=G.generateLevel(5);damage(p);assert.equal(V.validate(p).valid,false);}
const report={generatorVersion:G.VERSION,levelsGenerated:5000,levelsValidated:validated,uniqueFingerprints:fingerprints.size,duplicateConfigurations:duplicates,directionsObserved:directions.size,levelsWithCompatibleOverlaps:overlapping,dailyPuzzlesValidated:366,uniqueDailyPuzzles:dailyFP.size,curatedVocabularyEntries:Object.values(G.bank).reduce((n,w)=>n+w.length,0),categories:Object.keys(G.bank).length,tiers,maxPlacementAttemptsObserved:maxAttempts,fallbacksObserved:fallbacks,generationValidationDeterminismMs:Math.round(puzzleMs),totalTestMs:Math.round(performance.now()-start),runtime:process.version,platform:process.platform};
fs.writeFileSync(path.join(__dirname,'generator-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
