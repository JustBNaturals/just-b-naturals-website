import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseMobileReel} from '../instagram-gallery.js';
test('mobile autoplay selects one mostly visible reel and keeps current playback stable',()=>{
 const a={video:'a',ratio:0.6},b={video:'b',ratio:0.9};
 assert.equal(chooseMobileReel([a,b],null),b);
 assert.equal(chooseMobileReel([a,b],'a'),a);
 assert.equal(chooseMobileReel([{...a,ratio:0.3},b],'a'),b);
 assert.equal(chooseMobileReel([{...a,ratio:0.3}],null),null);
});
test('manual pauses and browser-blocked autoplay are respected',()=>{
 assert.equal(chooseMobileReel([{video:'a',ratio:1,userPaused:true}],null),null);
 assert.equal(chooseMobileReel([{video:'a',ratio:1,blockedAuto:true}],null),null);
 assert.equal(chooseMobileReel([],null),null);
});
