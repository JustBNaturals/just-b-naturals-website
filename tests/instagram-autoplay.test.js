import test from 'node:test';
import assert from 'node:assert/strict';
import {galleryPosts} from '../instagram-gallery.js';
test('connected posts and verified reel covers fill nine distinct chronological tiles',()=>{
 const connected=Array.from({length:6},(_,i)=>({permalink:`https://www.instagram.com/p/real${i}/`,timestamp:`2026-09-${20-i}`}));
 const posts=galleryPosts(connected);
 assert.equal(posts.length,9);assert.equal(new Set(posts.map(p=>p.permalink)).size,9);
 assert.equal(posts[0].id,'local-new-labels');assert.equal(posts[1].id,'local-maple-chai');assert.equal(posts[2].id,'local-cozy');
});
test('connected reel replaces a local cover and newer content displaces older content',()=>{
 const live={permalink:'https://www.instagram.com/reel/DekMYRiNu_z/',timestamp:'2026-10-16',type:'VIDEO',video:'/api/instagram/media?id=123&type=video'};
 const posts=galleryPosts([live]);assert.equal(posts.length,4);assert.equal(posts[1],live);
 const newer=Array.from({length:10},(_,i)=>({permalink:`https://www.instagram.com/p/new${i}/`,timestamp:'2026-10-26'}));
 assert.equal(galleryPosts(newer).length,9);assert.ok(galleryPosts(newer).every(p=>p.timestamp==='2026-10-26'));
});

import {reelPlayback} from '../instagram-gallery.js';
function fixture({allow=true,hidden=false,reject=false,deferred=false}={}){
 const classes=new Set();let resolve,plays=0,pauses=0;
 const state={ratio:0,tile:{classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)}},button:{setAttribute(k,v){this[k]=v;}},video:{dataset:{src:'/api/instagram/media?id=1&type=video'},src:'',play(){plays++;return reject?Promise.reject(new Error('Autoplay blocked')):deferred?new Promise(r=>resolve=r):Promise.resolve();},pause(){pauses++;}}};
 const environment={allow,hidden,shown:true};
 const playback=reelPlayback([state],{allowed:()=>environment.allow,hidden:()=>environment.hidden,visible:s=>s.ratio>=.35&&environment.shown});
 return {state,playback,environment,classes,get plays(){return plays;},get pauses(){return pauses;},finish:()=>resolve?.()};
}
const tick=()=>new Promise(r=>setImmediate(r));
test('viewport entry starts silent inline preview without any hover or click, then stops offscreen',async()=>{
 const f=fixture();f.playback.intersection(f.state,.5);await tick();assert.equal(f.plays,1);assert.equal(f.state.video.muted,true);assert.equal(f.state.video.defaultMuted,true);assert.ok(f.classes.has('is-previewing'));
 f.playback.intersection(f.state,.1);assert.ok(!f.classes.has('is-previewing'));assert.equal(f.state.requested,false);
 f.playback.intersection(f.state,.8);await tick();assert.equal(f.plays,2);
});
test('background tabs and CSS-hidden mobile tiles cannot keep playing',async()=>{
 const f=fixture();f.playback.intersection(f.state,.8);await tick();f.environment.hidden=true;f.playback.sync();assert.equal(f.state.requested,false);
 f.environment.hidden=false;f.playback.sync();await tick();assert.equal(f.plays,2);
 f.environment.shown=false;f.playback.sync();assert.equal(f.state.requested,false);f.playback.intersection(f.state,.8);assert.equal(f.plays,2);
});
test('reduced motion and data saver stop automatic playback but allow a deliberate play tap',async()=>{
 const f=fixture({allow:false});f.playback.intersection(f.state,.8);await tick();assert.equal(f.plays,0);f.playback.toggle(f.state);await tick();assert.equal(f.plays,1);
 f.playback.toggle(f.state);assert.equal(f.state.requested,false);f.environment.allow=true;f.playback.sync();assert.equal(f.plays,1);
 f.playback.intersection(f.state,0);f.playback.intersection(f.state,.8);await tick();assert.equal(f.plays,2);
});
test('blocked autoplay exposes a real tap control and does not loop play requests',async()=>{
 const f=fixture({reject:true});f.playback.intersection(f.state,.8);await tick();assert.ok(f.classes.has('needs-play'));assert.equal(f.state.requested,false);
 f.playback.sync();await tick();assert.equal(f.plays,1);f.playback.toggle(f.state);await tick();assert.equal(f.plays,2);
});
test('leaving viewport before play resolves cannot reveal a stale playing preview',async()=>{
 const f=fixture({deferred:true});f.playback.intersection(f.state,.8);f.playback.intersection(f.state,0);f.finish();await tick();assert.ok(!f.classes.has('is-previewing'));assert.equal(f.state.requested,false);assert.equal(f.state.button['aria-pressed'],'false');
});

test('multiple visible reels never play concurrently and the most visible takes over after pausing the first',async()=>{
 const a=fixture(),b=fixture(),states=[a.state,b.state];const events=[];
 for(const [name,f] of [['a',a],['b',b]]){const play=f.state.video.play,pause=f.state.video.pause;f.state.video.play=()=>{events.push('play '+name);return play();};f.state.video.pause=()=>{events.push('pause '+name);pause();};}
 const p=reelPlayback(states,{allowed:()=>true,hidden:()=>false,visible:s=>s.ratio>=.35});
 p.intersection(a.state,.7,true);p.intersection(b.state,.6,true);p.sync();await tick();assert.equal(states.filter(s=>s.requested).length,1);assert.equal(a.plays,1);assert.equal(b.plays,0);
 p.intersection(b.state,1);await tick();assert.equal(states.filter(s=>s.requested).length,1);assert.equal(a.state.requested,false);assert.equal(b.state.requested,true);assert.ok(events.indexOf('pause a')<events.indexOf('play b'));
});
test('a manual reel selection pauses the automatic reel and stays selected while it remains visible',async()=>{
 const a=fixture(),b=fixture(),states=[a.state,b.state];const p=reelPlayback(states,{allowed:()=>true,hidden:()=>false,visible:s=>s.ratio>=.35});
 p.intersection(a.state,1,true);p.intersection(b.state,.5,true);p.sync();await tick();p.toggle(b.state);await tick();assert.equal(a.state.requested,false);assert.equal(b.state.requested,true);
 p.sync();await tick();assert.equal(a.state.requested,false);assert.equal(b.state.requested,true);
 p.intersection(b.state,0);await tick();assert.equal(a.state.requested,true);assert.equal(b.state.requested,false);
});
test('a late play promise from the previous reel cannot reappear after another reel takes over',async()=>{
 const a=fixture({deferred:true}),b=fixture(),states=[a.state,b.state];const p=reelPlayback(states,{allowed:()=>true,hidden:()=>false,visible:s=>s.ratio>=.35});
 p.intersection(a.state,.5);p.intersection(b.state,1);await tick();a.finish();await tick();assert.equal(a.state.requested,false);assert.ok(!a.classes.has('is-previewing'));assert.equal(b.state.requested,true);assert.ok(b.classes.has('is-previewing'));
});
