# Local Demo Database Data

This project includes a small development-only dataset so the homepage, feed, topic pages, article pages, profiles and social interactions can be inspected before registering your own accounts.

## Add the demo data

1. Make sure MongoDB is running.
2. Make sure `server/.env` exists and points to the `hashnode_clone` database.
3. Open a terminal in the `server` folder.
4. Run:

   ```bash
   npm run seed
   ```

The script connects to the database, creates or updates the demo accounts, creates or reuses their tags and articles, and inserts the related interactions.

## Demo data included

- 3 demo accounts.
- 9 topics: JavaScript, React, Node.js, MongoDB, CSS, Express, Web Development, Authentication and Career.
- 12 articles: 10 published articles and 2 private drafts.
- Markdown content with headings and fenced code examples.
- 3 featured published articles for the homepage.
- 12 top-level comments and 6 replies.
- Article likes, comment likes, follows and bookmarks.

## Local demo accounts

All three accounts use this development-only password:

```text
DemoPass@123
```

| Name | Email | Username |
|---|---|---|
| Ashish Demo | `demo.ashish@hasnode.local` | `demo-ashish` |
| Priya Sharma | `demo.priya@hasnode.local` | `demo-priya` |
| Rahul Verma | `demo.rahul@hasnode.local` | `demo-rahul` |

Use these credentials only with your local development database. Do not deploy these accounts or this shared password to production.

## Safe to run again

The seed script is designed to be repeatable. It finds demo accounts by their reserved usernames, demo articles by their reserved `demo-` slugs, and interactions by their user/post/comment relationship. Re-running it updates those demo articles and reuses existing relationships instead of adding duplicates.

The script does not drop collections or delete records. It does not clear your existing Postman QA users, posts, tags or interactions. If a reserved demo username, email or article slug is already owned by a different account, the script stops with an explanatory error instead of overwriting that record.

## Important

Seed data is for local UI and workflow testing. The demo password is intentionally simple and shared. Never use it for a public deployment or a real account.
