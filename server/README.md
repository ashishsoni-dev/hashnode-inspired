# Hashnode Clone API

Express and MongoDB REST API for the `hasnode-clone` project.

## Setup

1. Install Node.js 20.19+ and MongoDB Community Server, or create a MongoDB Atlas database.
2. In this directory run `npm install`. This creates `server/package-lock.json`; keep it in Git for repeatable installs.
3. Copy `.env.example` to `.env` and set `MONGODB_URI` and a private random `JWT_SECRET` with at least 32 characters.
4. Start the API with `npm run dev`.
5. Verify `http://localhost:5000/api/health` returns HTTP 200 and `database: "connected"`.

## Scripts

- `npm run dev` — start the API with nodemon.
- `npm start` — start the API normally.
- `npm test` — run the built-in Node.js test runner.
- `npm run check` — syntax-check backend JavaScript and run the tests.

## Integration

The React frontend in `../client` connects to this API through Axios. Set `VITE_API_BASE_URL` in `client/.env` to `http://localhost:5000/api` for local development. The client automatically adds its saved JWT to requests that need authentication.

## Documents

- [`API.md`](./API.md) — routes, access levels, request bodies and response contracts.
- [`postman/hasnode-clone-phase2.postman_collection.json`](./postman/hasnode-clone-phase2.postman_collection.json) — backend verification collection (54 requests).

## Notes

- MongoDB is the source of truth for users, posts, tags and interactions.
- Password hashes are excluded from API responses.
- The acting user is derived from a verified JWT, never from a client-supplied user ID.
- Drafts can be incomplete; publishing requires a title, content, valid cover image URL and at least one tag.
- Featured status cannot be assigned through ordinary user endpoints.
- The Postman collection intentionally leaves its QA accounts and reusable test tag in MongoDB. Its cleanup removes test posts, comments and interactions.
- Keep `.env` out of Git. Use separate production secrets and database credentials for deployment.
