# Local Instagram-style gallery

The homepage uses six existing Just B Naturals photos in a static responsive grid. It has hover/focus overlays, subtle image zoom, enlarged photo viewing, previous/next and keyboard controls. The two verified October Instagram photos link to their original carousel; the other business photographs link to @justb.naturals without inventing individual post URLs, captions, dates, likes or comments. Captions are website descriptions, not quoted Instagram posts.

There is no Behold integration, external feed API, sign-in requirement or recurring service. All images are local. Edit the six cards in index.html to update the gallery. Real local videos can be added later if supplied; current tiles are photographs, not fake videos. English and French text are stored on the cards. The original section headline and description are retained.

October 17 connected feed: Behold account sign-in completed and the existing @justb.naturals source is connected. JSON feed `ls8nqtVeRM7cA4xGR5lY` is on the existing free plan (six posts); off-feed reels are enabled. Manage feed selection in Behold. No paid upgrade was purchased.

The homepage loads `/api/instagram` near the viewport. Images and actual reel video streams pass through same-origin media routes; credentials and Instagram access tokens are never stored in the repository or sent to shoppers. Upstream URLs are restricted to Behold/Instagram media hosts; post URLs must be actual Instagram links. JSON is cached for ten minutes, media responses for an hour. The October carousel already featured above is omitted from this section.

Desktop mouse hover previews a reel, with explicit play/pause buttons for touch and keyboard users. Videos are muted, inline, and downloaded only after an interaction. Only one preview plays at once; it pauses offscreen or when the tab is hidden. Reduced-motion and data-saving preferences disable hover autoplay. Clicking the photo opens its actual Instagram post. The five local brand photos remain a fallback if the feed is unavailable. Source Instagram captions remain in their original language; shopping controls are bilingual.
