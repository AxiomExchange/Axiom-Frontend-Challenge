# Challenge Questions

## 1. How I diagnosed the bottlenecks. What was actually slow, and how I confirmed it.

I started by running the app locally. The first thing I noticed was that the UI was flickering constantly even when I was not doing anything. When I clicked a token to see its details the sidebar was overlapping and the whole experience felt broken and slow.

I then looked at the search input. Every single keystroke was triggering a filter and sort of all 10,000 tokens with no delay. There was no debounce strategy in place so the more you typed the worse it got.

After that I read through the codebase and found the main issue. The TokenList component was mapping over all 10,000 tokens and mounting every single one of them to the DOM at the same time. The browser was holding 10,000 real elements in memory all at once and trying to update all of them every 500ms. That was the root cause of everything feeling slow and heavy.

---

## 2.My approach to virtualization and to the high-frequency update loop, and why I chose it over the alternatives considered.

The first thing I fixed was the 10,000 DOM nodes problem. I installed the react virtual library and used it to make sure only the tokens visible on screen are mounted to the DOM. The way this works is that the scroll container has a total height of 520,000 pixels which is 10,000 tokens multiplied by the fixed row height of 52 pixels. This makes the scrollbar behave as if all 10,000 rows exist. But inside that tall container only the rows that fall within the visible height of the screen are actually rendered as real DOM elements. The other tokens still exist in memory as plain JavaScript objects but they have no DOM node. When you scroll the page the tokens coming into view get mounted and the ones leaving get removed. This means the browser is only ever tracking around 20+ tokens instead of 10,000.

For the live update problem I replaced the useState approach with an external token store. Before this the stream was calling setTokens every 500ms which told React to re-render the whole app from the top every time. Now the stream writes directly into the store and each visible row subscribes to only its own token. 

For the search I added a debounce so the filter and sort only runs after the user stops typing for 200ms instead of on every keystroke. I also wrapped the sort in useMemo so it only recomputes when the search query or sort key actually changes and not on every render

I considered using React Query but that tool is built for fetching data from a server. There is no server or API here so it would have added complexity with no benefit. I also considered Zustand and Redux for managing the store but since the data is all local and in memory a plain JavaScript Map with a subscribe pattern was enough. Adding a library on top of that would have been unnecessary.
.

---

## 3. The trade-offs I made and methods deliberately left out.

I used a fixed row height of 52 pixels for the virtualizer. This keeps things simple and fast because there is no need to measure each row in the DOM. The rows are all the same structure so this is accurate and it avoids a lot of complexity around dynamic sizing.

The sort is throttled to 500ms which matches the original stream interval. This means the list reorders at the same speed the data was already updating. I chose this over a longer delay like 1 second because a slower reorder would make prices and positions feel out of sync in a trading context.

I deliberately left out React Query with pagination. React Query is built for fetching and caching data from a server and there is no server or API in this app so it would have added a dependency that does nothing useful here. Pagination was also not an option because the task instructions specifically say not to fake performance. Showing 20+ tokens with a load more button would have been breaking that rule directly.

I also left out Zustand and Redux for data management. Both of those are good tools but they are built on top of the same subscribe pattern I implemented directly. Since all the data is local and in memory adding either library would have been wrapping something that already does exactly what is needed.

---

## 4. What I would do next with more time.

The biggest thing I would do is break the feed into sections instead of one flat list of 10,000 tokens. Right now everything is one continuous scroll. A better structure would be to group tokens into categories such as top performers, trending, new listings, and the rest of the feed. Each section would load and update its own slice of data independently. This means instead of sorting and filtering one massive array you are working with smaller focused groups that are much cheaper to process and easier to navigate.

Within that I would pin the top tokens to the top of the feed at all times. If a token is leading the market it should always be visible without the user having to scroll.

I would also spend more time optimizing the experience on mobile screens. The current implementation hides certain columns on small screens using CSS but the DOM nodes for those columns still get created on every row. On a device with limited memory and a slower processor that adds up quickly. A proper fix would be to detect the screen size and not render those columns at all rather than just hiding them visually.
