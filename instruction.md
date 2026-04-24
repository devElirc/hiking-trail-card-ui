Build a polished hiking trail card in /app/index.html by replacing the placeholder content.

Use the trail data for Misty Ridge Loop with trail ID "misty-ridge-loop". 
The card needs to show region "North Cascades", rating "4.7", location "Cascade Pass Trailhead, Marblemount, Washington", length "12.4 km", ascent "540 m", time "3h 20m", difficulty "Moderate", terrain "forest ridge", and the message "Best after early morning fog lifts". 
Use the image file from /app/images/trail-card.jpg, but in the HTML, set the image source to src="images/trail-card.jpg". 
Also, give the reason message a gradient overlay style.
Make the entire card a single clickable link to "/trails/misty-ridge-loop". 
The hover lift and stronger hover shadow should apply to that outer clickable card element, not just to something nested inside it.

The card should feel polished, with clear spacing, a responsive width, and strong visual hierarchy on both desktop and mobile.

At the top of the card, show a wide trail image and use src="images/trail-card.jpg" for the image path.
Handle image failure safely so the card still looks complete if the image does not load, and include meaningful non-empty alt text. 
Put the region label over the image and include a rating badge there too.

Show the reason message across the bottom of the image with a gradient treatment that stays readable without taking over the card.

Below the image, show the trail name as the main title. 
Keep the location on a single line and trim long text cleanly instead of wrapping.

Add a compact stats row for distance, ascent, and time.

At the bottom, show a footer with visible "Moderate" difficulty text, a visible difficulty meter, and the terrain text.

Add a gentle image zoom on hover and make the card feel interactive without losing readability. Use accessible labels or text where needed so the card is easy to understand and use.
