# Hashnode Inspired

An independent developer publishing platform built with the MERN stack. Hashnode Inspired enables developers to publish technical articles written in Markdown, organize content with topic tags, discover posts, and interact with other authors.

This is an independent educational project inspired by developer-publishing platforms. It is not affiliated with, endorsed by, or an official product of Hashnode.

## Features

### Authentication and accounts

- User registration and login with email and password.
- Password hashing with `bcryptjs`.
- JWT-based authentication with session restoration after a browser refresh.
- Logout and protected routes for authenticated pages.
- Public author profiles with a display name, biography, and published articles.
- Profile settings for updating the display name, biography, and avatar.

### Article publishing and management

- Create, save, edit, publish, and delete articles.
- Save articles as drafts before publication.
- Write article content in Markdown, including headings, emphasis, links, lists, and fenced code blocks.
- Syntax highlighting for supported fenced-code languages.
- Add a cover image and one or more topic tags to an article.
- View and manage personal drafts and published articles in the dashboard.
- Server-side ownership checks for article updates and deletion.
- Creation and update timestamps for article records.

### Public discovery

- Public homepage and article discovery experience.
- Public feed of published articles, ordered newest first, with title search and topic filtering.
- Topic directory with published-article counts.
- Topic pages showing published articles associated with a selected tag.
- Individual article pages with rendered Markdown and author information.
- Drafts are excluded from public feeds, topic pages, and public author profiles.

### Additional implemented features

The following features correspond to optional extensions listed in the PRD:

- Post likes and like counts.
- Threaded comments and replies.
- Reading-time estimates.
- Follow and unfollow authors, with follower and following information.
- Public-feed pagination.
- Bookmarks and a saved-articles page.
- Light and dark themes with a persisted theme preference.
- Cloudinary image uploads for profile avatars and article cover images.

A personalized feed containing only articles from followed authors is not currently implemented.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React, JavaScript, Vite |
| Routing | React Router |
| HTTP client | Axios |
| Shared frontend state | React Context API and React hooks |
| Styling | CSS, responsive styles, light and dark themes |
| Markdown | `react-markdown` |
| Code highlighting | `react-syntax-highlighter` |
| Backend | Node.js and Express |
| Database and ODM | MongoDB and Mongoose |
| Authentication | `jsonwebtoken` and `bcryptjs` |
| Configuration | `dotenv` |
| Testing and development tools | Postman or Thunder Client for manual API testing; Node.js built-in test runner; ESLint and Vite build for the client |
| Image storage | Cloudinary (optional configuration) |

The application uses JavaScript. It does not use TypeScript, Redux, or server-side rendering. The React client communicates with MongoDB only through the Express REST API.

## Application architecture

The application is divided into a React single-page application and an Express REST API. Axios sends HTTP requests from the browser to the API. Express routes pass requests through middleware and controllers; Mongoose handles database operations in MongoDB. Postman and Thunder Client are external tools for manually testing API requests; they are not part of the running application or its architecture.

```text
Browser
  |
  v
React + Vite application
  |  React Router, Context API, Axios
  |  HTTP requests (JSON; JWT for protected requests)
  v
Express REST API
  |  Routes, middleware, controllers
  |  Mongoose
  v
MongoDB
```

Authentication uses a JWT sent in the `Authorization: Bearer <token>` header for protected API requests. The backend verifies the token and enforces ownership; frontend route protection is not used as a substitute for server-side authorization.

## Project structure

```text
hashnode-inspired/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/              # Axios instance and API request modules
│   │   ├── components/       # Shared UI, layout, editor, and post components
│   │   ├── context/          # Authentication and theme providers
│   │   ├── hooks/            # Reusable React hooks
│   │   ├── pages/            # Homepage, feed, editor, dashboard, profiles, etc.
│   │   ├── styles/           # Global, theme, feed, and responsive styles
│   │   └── utils/            # Frontend helper functions
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── server/
│   ├── config/               # Database connection
│   ├── controllers/          # API request handlers
│   ├── middleware/           # Authentication, validation, and error handling
│   ├── models/               # Mongoose models
│   ├── postman/              # API test collection
│   ├── routes/               # REST API route definitions
│   ├── scripts/              # Development and syntax-check scripts
│   ├── tests/                # Backend tests
│   ├── utils/                # Backend helper functions
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── README.md
```

## Prerequisites

- Node.js `20.19.0` or newer and npm.
- MongoDB Community Server running locally, or a MongoDB Atlas database.
- Git.

## Local installation and setup

### 1. Clone the repository

```bash
git clone https://github.com/<your-github-username>/hashnode-inspired.git
cd hashnode-inspired
```

Replace `<your-github-username>` with the GitHub account that owns the repository.

### 2. Install backend dependencies

```bash
cd server
npm ci
```

### 3. Configure the backend environment

Create `server/.env` from the example file.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Configure the values in `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/hashnode_clone
JWT_SECRET=replace_with_a_private_random_secret_at_least_32_characters_long
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
JSON_BODY_LIMIT=2mb
BCRYPT_SALT_ROUNDS=12

# Optional: required only for Cloudinary image uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Use your local MongoDB URI or a private MongoDB Atlas connection string. Set `JWT_SECRET` to a private random value of at least 32 characters. Do not commit the real `.env` file or share its values.

### 4. Install frontend dependencies

Open a second terminal at the repository root:

```bash
cd client
npm ci
```

Create `client/.env` from the example file.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

The local frontend environment should contain:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Only the API base URL belongs in the frontend environment. Variables prefixed with `VITE_` are included in the browser bundle and must never contain secrets.

### 5. Start the application

Start MongoDB first. Then run the backend in one terminal:

```bash
cd server
npm run dev
```

Start the frontend in a separate terminal:

```bash
cd client
npm run dev
```

Open the Vite development URL shown in the frontend terminal. It is normally `http://localhost:5173`.

The backend health endpoint is:

```text
http://localhost:5000/api/health
```

A healthy response reports that the service is healthy and the database is connected.

## Application routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Homepage and article discovery sections |
| `/feed` | Public | Searchable, filterable, paginated article feed |
| `/post/:slug` | Public | Published article detail |
| `/tags` | Public | Topic directory |
| `/tag/:slug` | Public | Published articles for a topic |
| `/login` | Public | Sign in |
| `/register` | Public | Create an account |
| `/profile/:id` | Public | Author profile and published articles |
| `/dashboard` | Protected | Manage the signed-in user's articles |
| `/editor/new` | Protected | Create an article or draft |
| `/editor/:id` | Protected; owner only | Edit an owned article |
| `/settings` | Protected | Update the signed-in user's profile |
| `/bookmarks` | Protected | View saved articles |

The homepage is a discovery page; the complete paginated public feed is available at `/feed`. The PRD lists the public feed at `/`; this implementation separates the homepage and full feed into `/` and `/feed`, respectively.

## REST API overview

The API base URL in local development is `http://localhost:5000/api`. Protected endpoints require a valid JWT in the `Authorization` header.

### Core endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a user |
| `POST` | `/auth/login` | Public | Authenticate and receive a JWT |
| `GET` | `/auth/me` | Protected | Retrieve the authenticated user's profile |
| `GET` | `/posts` | Public | List published posts; supports search, tag, sorting, and pagination |
| `GET` | `/posts/:slug` | Public | Retrieve a published post |
| `POST` | `/posts` | Protected | Create a draft or published post |
| `GET` | `/posts/mine` | Protected | List the current user's drafts and published posts |
| `PUT` | `/posts/:id` | Owner only | Update an owned post |
| `DELETE` | `/posts/:id` | Owner only | Delete an owned post |
| `GET` | `/tags` | Public | List topics and published-post counts |
| `GET` | `/tags/:slug/posts` | Public | List published posts under a topic |
| `POST` | `/tags` | Protected | Create or reuse a topic |
| `GET` | `/users/:id` | Public | Retrieve a public author profile and published posts |
| `PUT` | `/users/me` | Protected | Update the current user's profile |

### Additional implemented endpoints

The application also exposes endpoints for post likes and bookmarks, comments and replies, comment likes, author follows, follower/following lists, saved articles, and Cloudinary upload signatures. These support optional extensions described in the PRD.

The API returns JSON. Successful responses use a `success` and `data` structure; paginated responses also include pagination metadata. Errors use a consistent JSON error structure. The Postman collection is available at `server/postman/hasnode-clone-phase2.postman_collection.json` for manual API testing.

## Validation and tests

Run the backend syntax check and test suite from the `server` directory:

```bash
npm run check
```

Run the backend tests alone with:

```bash
npm test
```

Run the frontend lint check and production build from the `client` directory:

```bash
npm run lint
npm run build
```

## Deployment

The application is designed to use MongoDB Atlas for the database, Render for the Express API, and Netlify for the React frontend.

### Database — MongoDB Atlas

- Create a separate production database, for example `hashnode_clone_production`.
- Use a dedicated database user with read/write access only to that database.
- Configure Atlas network access for the deployed backend.
- Keep the MongoDB connection string private and set it as `MONGODB_URI` in the backend hosting environment.

### Backend — Render

Create a Web Service connected to this repository and configure:

| Setting | Value |
|---|---|
| Root directory | `server` |
| Build command | `npm ci` |
| Start command | `npm start` |
| Health check path | `/api/health` |

Set these environment variables in Render:

- `NODE_ENV=production`
- `MONGODB_URI` — production Atlas connection string
- `JWT_SECRET` — private random value of at least 32 characters
- `JWT_EXPIRES_IN=1d`
- `CLIENT_URL` — exact HTTPS origin of the deployed frontend, without a trailing slash
- `JSON_BODY_LIMIT=2mb`
- `BCRYPT_SALT_ROUNDS=12`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` — only when enabling Cloudinary uploads

Render provides the `PORT` environment variable. Do not hardcode a production port.

### Frontend — Netlify

Connect the same repository to Netlify and configure:

| Setting | Value |
|---|---|
| Base directory | `client` |
| Build command | `npm ci && npm run build` |
| Publish directory | `dist` |

Set the frontend environment variable:

```env
VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api
```

After the Netlify site is deployed, set its exact HTTPS origin as the backend's `CLIENT_URL` in Render and redeploy the backend. The `client/public/_redirects` file supports direct navigation and refreshes on React Router routes.

Verify the deployed API at `https://<your-render-service>.onrender.com/api/health`, then test registration, login, article publishing, public browsing, and protected actions against the deployed services.

Free hosting plans may have usage limits or cold starts; they should not be treated as an always-on commercial hosting guarantee.

## Security notes

- Passwords are hashed with `bcryptjs`; plaintext passwords are not stored.
- The server verifies JWTs for protected API requests.
- The server enforces article ownership for edits and deletions.
- Draft articles are private and excluded from public feeds, topic pages, and author profiles.
- Keep real `.env` files and all credentials out of version control.
- Never expose `JWT_SECRET`, MongoDB credentials, or the Cloudinary API secret in frontend code or `VITE_` variables.
- Use separate development and production database credentials.

## Project scope

Hashnode Inspired implements the mandatory publishing-platform requirements in the supplied project specification and includes several optional extensions. The personalized feed of followed authors is not included. This repository is an independent educational project; it does not reproduce or represent the official Hashnode service.
