import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseVisibleReel, galleryPosts} from '../instagram-gallery.js';
test('viewport autoplay selects one mostly visible reel and keeps current playback stable on any device',()=>{
 const a={video:'a',ratio:0.6},b={video:'b',ratio:0.9};
 assert.equal(chooseVisibleReel([a,b],null),b);
 assert.equal(chooseVisibleReel([a,b],'a'),a);
 assert.equal(chooseVisibleReel([{...a,ratio:0.3},b],'a'),b);
 assert.equal(chooseVisibleReel([{...a,ratio:0.3}],null),null);
});
test('manual pauses and browser-blocked autoplay are respected',()=>{
 assert.equal(chooseVisibleReel([{video:'a',ratio:1,userPaused:true}],null),null);
 assert.equal(chooseVisibleReel([{video:'a',ratio:1,blockedAuto:true}],null),null);
 assert.equal(chooseVisibleReel([],null),null);
});
test('six connected posts and three verified reel covers fill nine distinct chronological tiles',()=>{
 const connected=Array.from({length:6},(_,i)=>({permalink:`https://www.instagram.com/p/real${i}/`,timestamp:`2026-09-${20-i}`}));
 const posts=galleryPosts(connected);
 assert.equal(posts.length,9);assert.equal(new Set(posts.map(p=>p.permalink)).size,9);
 assert.equal(posts[0].id,'local-maple-chai');assert.equal(posts[1].id,'local-cozy');assert.equal(posts[2].id,'local-boreal');
});
test('connected reel replaces a local cover and newer content displaces older content',()=>{
 const live={permalink:'https://www.instagram.com/reel/DekMYRiNu_z/',timestamp:'2026-10-16',type:'VIDEO',video:'/api/instagram/media?id=123&type=video'};
 const posts=galleryPosts([live]);assert.equal(posts.length,3);assert.equal(posts[0],live);
 const newer=Array.from({length:10},(_,i)=>({permalink:`https://www.instagram.com/p/new${i}/`,timestamp:'2026-10-22'}));
 assert.equal(galleryPosts(newer).length,9);assert.ok(galleryPosts(newer).every(p=>p.timestamp==='2026-10-22'));
});
