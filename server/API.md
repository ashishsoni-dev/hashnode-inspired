# Hashnode Clone API Reference

Base URL: `http://localhost:5000/api`

The API returns JSON. Successful responses use `{ "success": true, "data": ... }`. Paginated endpoints also return a `pagination` object. Errors use `{ "success": false, "error": { "message": "..." } }`.

## Authentication

Protected requests must include:

```http
Authorization: Bearer <JWT>
```

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Create an account using `{ name, email, password }` |
| POST | `/auth/login` | Public | Verify credentials and return a JWT |
| GET | `/auth/me` | Protected | Return the authenticated user's safe profile |

Passwords are hashed with bcryptjs before persistence. The password hash is excluded from normal queries and every API response. JWTs are signed using `JWT_SECRET` and the API uses `HS256` with issuer and audience checks.

Registration requires a name, valid email, and password between 8 and 128 characters. Username is generated from the name and made unique; it does not need to be supplied by the client.

## Posts

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/posts` | Public; optional JWT for interaction state | Published feed; query: `page`, `limit`, `search`, `tag`, `sort` |
| GET | `/posts/featured` | Public | Published posts marked featured by a trusted database/admin operation |
| GET | `/posts/:slug` | Public; optional JWT for interaction state | One published article by slug |
| POST | `/posts` | Protected | Create a draft or publish a post |
| GET | `/posts/mine` | Protected | List the current user's drafts and published posts |
| GET | `/posts/mine/:id` | Protected; owner only | Fetch one owned post including its Markdown body for editing |
| PUT | `/posts/:id` | Protected; owner only | Update an owned post |
| DELETE | `/posts/:id` | Protected; owner only | Delete an owned post and its post interactions/comments |

Create/update body fields:

```json
{
  "title": "Building a REST API with Express",
  "content": "# Article\n\nMarkdown content...",
  "coverImage": "https://example.com/cover.jpg",
  "tags": ["javascript", "express"],
  "status": "draft"
}
```

`status` must be `draft` or `published`. Drafts may omit title, content, cover image and tags. A published post must have a non-empty title, Markdown content, an HTTP/HTTPS cover image URL, and at least one tag. The authenticated user is assigned as author from the verified JWT; fields such as `author`, `authorId`, `featured`, `likes`, and `bookmarks` supplied by a client are not trusted.

Public feed defaults to page 1 and 9 posts. `limit` is capped at 50. `search` matches title text. `tag` accepts a tag slug. `sort` accepts `newest` (default) or `oldest`. Response includes pagination metadata: `page`, `limit`, `total`, `totalPages`, `hasNextPage`, `hasPreviousPage`.

The server returns card-compatible names (`description`, `thumbnail`, `authorId`, `tag`, `likes`, etc.) alongside the canonical API fields, but it stores only canonical fields in MongoDB. Feed responses omit the full Markdown body; article detail and owner-editor retrieval include it.

`featured` is intentionally not writable through public post create/update requests. Set `featured: true` only through an authorized administrative/database operation. This is a capstone project and does not currently implement a role-based admin UI.

## Tags

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/tags` | Public | List tags with counts of published posts |
| GET | `/tags/:slug/posts` | Public; optional JWT for interaction state | Paginated published posts under a tag |
| POST | `/tags` | Protected | Create/reuse a tag using `{ "name": "javascript" }` |

Tag names are trimmed, whitespace-normalized and stored lowercase. Existing names are reused instead of creating case-only duplicates. Posts may send tag names or existing tag IDs in `tags`.

## Users and profiles

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/users/:id` | Public; optional JWT for `isFollowing` | Public profile and paginated published posts; `:id` accepts MongoDB ID or username |
| PUT | `/users/me` | Protected | Update own `{ name, bio, avatarUrl }` |
| PUT | `/users/:id/follow` | Protected | Follow an author; idempotent |
| DELETE | `/users/:id/follow` | Protected | Unfollow an author; idempotent |
| GET | `/users/me/following` | Protected | List followed authors |
| GET | `/users/me/followers` | Protected | List followers |
| GET | `/users/me/bookmarks` | Protected | List the current user's saved published posts |

Public profiles never return email or password fields. Follower/following counts are derived from the Follow collection. A user cannot follow themselves or edit another user's profile.

## Post likes and bookmarks

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| PUT | `/posts/:id/like` | Protected | Like a published post; idempotent |
| DELETE | `/posts/:id/like` | Protected | Remove own like; idempotent |
| PUT | `/posts/:id/bookmark` | Protected | Bookmark a published post; idempotent |
| DELETE | `/posts/:id/bookmark` | Protected | Remove own bookmark; idempotent |

Responses include the resulting boolean state and fresh counts. Unique compound indexes prevent duplicate records.

## Comments and replies

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/posts/:id/comments` | Public; optional JWT for `isLiked` | Get a published post's top-level comments and replies |
| POST | `/posts/:id/comments` | Protected | Create a comment or reply |
| PUT | `/comments/:id` | Protected; owner only | Edit own comment |
| DELETE | `/comments/:id` | Protected; owner only | Delete own comment (deleting a top-level comment also deletes its replies) |
| PUT | `/comments/:id/like` | Protected | Like a comment or reply; idempotent |
| DELETE | `/comments/:id/like` | Protected | Remove own comment/reply like |

Create a top-level comment:

```json
{ "content": "This explanation helped a lot." }
```

Create a reply:

```json
{
  "content": "Thanks for adding that!",
  "parentCommentId": "<top-level-comment-id>"
}
```

Replies must reference a top-level comment belonging to the same article. This matches the current frontend's comment/reply presentation. Comment content is limited to 1,000 characters.

## Operational endpoints and errors

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` (under `/api`) | API and MongoDB readiness |

Common statuses: `200` success, `201` created, `204` deleted, `400` invalid input/ID, `401` missing or invalid token, `403` disallowed origin/forbidden action, `404` missing resource, `409` duplicate unique value, `413` oversized payload, `500` unexpected server error, and `503` database unavailable on health check.

The API uses centralized JSON error handling. Production errors do not expose stack traces or database internals.


## Image uploads

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/uploads/signature` | Protected | Create a short-lived signature for an avatar or cover image upload |

Request body:

```json
{ "purpose": "avatar" }
```

Use `purpose: "cover"` for an article cover image. The endpoint only signs the fixed `hashnode-clone/avatars` and `hashnode-clone/covers` folders. The client uploads the selected image directly to Cloudinary using the returned cloud name, API key, timestamp, folder and signature. The Cloudinary API secret is only read by the server and is never returned.

The server requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in its environment.
