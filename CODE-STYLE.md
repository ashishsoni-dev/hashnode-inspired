# Beginner-Friendly Code Guide

This project is intended to be readable by a beginner-to-intermediate JavaScript developer. It uses normal JavaScript files, React function components, React hooks, React Context, Express routes and controllers, and Mongoose models. It does not use TypeScript, Redux, server-side rendering, or a custom framework.

## How the folders are organized

- `client/src/pages/` contains the screens shown by the browser.
- `client/src/components/` contains reusable pieces of those screens, such as the navbar and article cards.
- `client/src/api/` contains the functions that send requests to the Express server.
- `client/src/context/` contains shared application state, such as the signed-in user and theme.
- `client/src/hooks/` contains small reusable React hooks.
- `client/src/styles/` contains the existing visual design, theme variables and responsive styles.
- `server/routes/` connects URL paths to controller functions.
- `server/controllers/` contains the main request handling and database operations.
- `server/models/` describes the MongoDB document structure.
- `server/middleware/` contains checks that run before a protected controller.
- `server/utils/` contains small helper functions shared by controllers.

## Code conventions used here

1. Use descriptive names such as `searchLatestPosts`, `getPosts` and `isSearchingLatest`.
2. Prefer small functions that do one clear job.
3. Use `async` and `await` for asynchronous API and database work.
4. Keep browser requests in the API modules instead of repeating Axios calls in every page.
5. Keep page-specific input and loading state in the page or component that uses it.
6. Use comments to explain why a non-obvious step exists, not to repeat what every line already says.
7. Keep secrets in `server/.env`. Anything in `client/.env` is public to the browser.

Some normal React concepts in the project—such as `useEffect`, `useCallback`, `useRef`, Context and lazy-loaded routes—are included because they solve specific problems in this application. They are used directly rather than hidden behind a large state-management library.

## How the Homepage Latest Posts search works

The search is in the Latest Posts section and updates automatically while the visitor types. There is no Search button.

1. `PostFeed.jsx` stores the text in `searchInput` using `useState`.
2. When the text changes, an effect starts a 350 millisecond timer.
3. If the visitor types again before the timer ends, the old timer is cleared.
4. When typing pauses, `PostFeed` calls the `onSearch` function it received from `App.jsx`.
5. `App.jsx` calls `getPosts()` with the search text and a limit of nine.
6. The Express API searches the titles of all published posts, then returns the newest nine matches and the total matching count.
7. Clearing the input sends an empty search, so the API returns the nine newest published posts again.

The search is not limited to the nine posts that were initially visible. The API searches the full set of published articles before applying the nine-card page limit. The **View all matching posts** link opens the regular Feed page, where the visitor can use pagination to see more results.

## Main files for this feature

- `client/src/components/post/PostFeed.jsx` — search input, delay timer, result status and article cards.
- `client/src/App.jsx` — loads homepage data and requests matching articles.
- `client/src/api/postsApi.js` — sends the request to `GET /api/posts`.
- `server/controllers/postController.js` — filters published posts by title and applies pagination.

The homepage card limit is kept in one named constant, `HOMEPAGE_POST_LIMIT`, in `App.jsx`. This makes the normal section size easy to understand and change in one place.
