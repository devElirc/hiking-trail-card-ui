Please update /app/index.html by replacing the placeholder with a polished hiking trail card for Misty Ridge Loop. 
Make the entire card one clickable link that goes to /trails/misty-ridge-loop, and apply the lift and stronger shadow hover effect to that outer link. 
Use these exact trail details: region North Cascades, rating 4.7, location Cascade Pass Trailhead, Marblemount, Washington, distance 12.4 km, ascent 540 m, time 3h 20m, difficulty Moderate, terrain forest ridge, and note Best after early morning fog lifts. 

At the top, show a wide image using src="images/trail-card.jpg" with meaningful alt text, and keep the image area visible even if the image does not load (for example an inline `onerror` on that `<img>`, or a short `<script>` that listens for `error` on that image and swaps in a placeholder or background). 
Place the region badge and rating badge on top of the image, and show the note across the bottom of the image on a readable overlay using a linear-gradient. 
Below the image, show the trail name as the main heading, then the location on a single line with truncation using white-space: nowrap, overflow: hidden, and text-overflow: ellipsis. 
Add a compact stats row with labels for Distance, Ascent, and Time. 

At the bottom, show Difficulty, Moderate, a visible difficulty meter that is accessible through role="meter" or an aria-label that includes Difficulty, and the terrain text. 
The card should look clean and polished, work well on both mobile and desktop, and include a gentle image zoom on hover.