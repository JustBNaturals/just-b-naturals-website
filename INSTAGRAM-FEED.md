# Automatically refreshed Instagram gallery

The homepage shows nine posts on desktop and the first six on mobile (up to 680px), merging the six-post connected @justb.naturals feed with three verified local reel covers: Maple Chai (October 16), Cozy (September 29), and Boréal (September 28, 2026). Behold currently omits these video files. They are image links to the actual reels, with no simulated playback. The connected feed supplies two playable videos. Posts are ordered by publication date. If Behold supplies a missing reel later, its connected video replaces the local cover automatically; newer feed posts can push older covers out of the latest nine. Desktop uses three columns; mobile uses two. The explanatory note beneath the grid has been removed in both languages.

Behold Curate is set to six posts, all post types, off-feed reels enabled, and Publish immediately for new posts. No shopper sign-in is required. The original section headline and description are retained.

October 17 connected feed: Behold account sign-in completed and the existing @justb.naturals source is connected. JSON feed `ls8nqtVeRM7cA4xGR5lY` is on the existing free plan (six posts); off-feed reels are enabled. Manage feed selection in Behold. No paid upgrade was purchased.

The homepage loads `/api/instagram` near the viewport and checks again every five minutes while the section is visible, and when returning to the tab. Unchanged feeds do not redraw. Playing videos and keyboard focus are not interrupted. Images and actual reel video streams pass through same-origin media routes; credentials and Instagram access tokens are never stored in the repository or sent to shoppers. Upstream URLs are restricted to Behold/Instagram media hosts; post URLs must be actual Instagram links. JSON is cached for ten minutes, media responses for an hour. Instagram/Behold synchronization adds its own delay: new posts are automatic, not guaranteed instantaneous. No redeployment is needed for new posts.

The prior hover-only playback has been replaced by the viewport lifecycle below.
## October 26 playback update

Visible reel tiles now play muted and inline on both touch and mouse devices at 35% visibility, and pause when scrolled away, hidden by the mobile grid, or in a background tab. Reduced-motion and data-saver preferences suppress automatic playback; a deliberate play control remains available. A section-wide pause control is available. Browser autoplay rejection exposes a tap-to-play button without replacing the Instagram link. One failed thumbnail no longer blocks all feed replacement. Refreshes still run every five minutes and unchanged feeds are not redrawn.

The live provider feed is still returning October 1 and earlier posts. Maple Chai remains a real cover linked to its original working Instagram reel, not an inline video: the source feed omits its video. Restoring that media requires refreshing the Behold source under the owner account, or an original authorized MP4 hosted locally. Instagram’s web player currently exposes a MediaSource blob and its ordinary video download failed. Do not substitute an expiring URL or animate the still cover. Behold sign-in is pending.

The October 25 new-label reel cover was downloaded from the owner’s Instagram profile on October 26 and preserved unchanged at images/instagram/new-labels-20261026.jpg. It links to De7uQEZRIKH. Its native reel is 34 seconds; the local copy is clearly an image link until its actual video is available through the connected feed.
