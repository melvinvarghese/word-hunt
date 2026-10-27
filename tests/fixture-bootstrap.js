/* Test-only, isolated in-memory save: never accesses the production save key. */
'use strict';
let fixtureState=WordHuntCore.defaults();fixtureState.current=Math.max(1,Math.min(5000,Number(new URLSearchParams(location.search).get('level'))||1));fixtureState.unlocked=5000;
WordHuntCore.load=()=>({state:fixtureState,available:true});WordHuntCore.save=(_storage,state)=>{fixtureState=state;return true;};
