# Automatically refreshed Instagram gallery

The homepage shows the six latest posts supplied by the connected @justb.naturals feed, including photos, carousel covers, and real reels. Desktop uses three columns; mobile uses two. No posts are manually omitted.

Behold Curate is set to six posts, all post types, off-feed reels enabled, and Publish immediately for new posts. No shopper sign-in is required. The original section headline and description are retained.

October 17 connected feed: Behold account sign-in completed and the existing @justb.naturals source is connected. JSON feed `ls8nqtVeRM7cA4xGR5lY` is on the existing free plan (six posts); off-feed reels are enabled. Manage feed selection in Behold. No paid upgrade was purchased.

The homepage loads `/api/instagram` near the viewport and checks again every five minutes while the section is visible, and when returning to the tab. Unchanged feeds do not redraw. Playing videos and keyboard focus are not interrupted. Images and actual reel video streams pass through same-origin media routes; credentials and Instagram access tokens are never stored in the repository or sent to shoppers. Upstream URLs are restricted to Behold/Instagram media hosts; post URLs must be actual Instagram links. JSON is cached for ten minutes, media responses for an hour. Instagram/Behold synchronization adds its own delay: new posts are automatic, not guaranteed instantaneous. No redeployment is needed for new posts.

Desktop mouse hover previews a reel, with explicit play/pause buttons for touch and keyboard users. Videos are muted, inline, and downloaded only after an interaction. Only one preview plays at once; it pauses offscreen or when the tab is hidden. Reduced-motion and data-saving preferences disable hover autoplay. Clicking the photo opens its actual Instagram post. The five local brand photos remain a fallback if the feed is unavailable. Source Instagram captions remain in their original language; shopping controls are bilingual.
