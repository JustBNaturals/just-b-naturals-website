import test from 'node:test';
import assert from 'node:assert/strict';
import {visibleReels, galleryPosts} from '../instagram-gallery.js';
test('every visible reel qualifies for simultaneous autoplay on any device',()=>{
 const a={video:'a',ratio:0.6},b={video:'b',ratio:0.9};
 assert.deepEqual(visibleReels([a,b]),[a,b]);
 assert.deepEqual(visibleReels([{...a,ratio:0.25},b]),[{...a,ratio:0.25},b]);
 assert.deepEqual(visibleReels([{...a,ratio:0.2},b]),[b]);
 assert.deepEqual(visibleReels([{...a,ratio:0}]),[]);
});
test('manual pauses and browser-blocked autoplay are respected',()=>{
 const a={video:'a',ratio:1},b={video:'b',ratio:1};
 assert.deepEqual(visibleReels([{...a,userPaused:true},b]),[b]);
 assert.deepEqual(visibleReels([{...a,blockedAuto:true},b]),[b]);
 assert.deepEqual(visibleReels([]),[]);
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
