import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "../config/db.js";

import User from "../models/User.js";
import Post from "../models/Post.js";
import Tag from "../models/Tag.js";
import Like from "../models/Like.js";
import Follow from "../models/Follow.js";
import Comment from "../models/Comment.js";
import CommentLike from "../models/CommentLike.js";
import Bookmark from "../models/Bookmark.js";

const DEMO_PASSWORD = "DemoPass@123";

const demoUsers = [
    {
        name: "Ashish Demo",
        username: "demo-ashish",
        email: "demo.ashish@hasnode.local",
        password: DEMO_PASSWORD,
        bio: "Frontend and full-stack developer exploring JavaScript, React and Node.js.",
        avatarUrl: "https://i.pravatar.cc/160?img=12",
    },
    {
        name: "Priya Sharma",
        username: "demo-priya",
        email: "demo.priya@hasnode.local",
        password: DEMO_PASSWORD,
        bio: "UI-focused developer who enjoys building accessible and responsive experiences.",
        avatarUrl: "https://i.pravatar.cc/160?img=47",
    },
    {
        name: "Rahul Verma",
        username: "demo-rahul",
        email: "demo.rahul@hasnode.local",
        password: DEMO_PASSWORD,
        bio: "Backend developer interested in APIs, databases and dependable software.",
        avatarUrl: "https://i.pravatar.cc/160?img=53",
    },
];

const demoTags = [
    { name: "javascript", slug: "javascript" },
    { name: "react", slug: "react" },
    { name: "node.js", slug: "nodejs" },
    { name: "mongodb", slug: "mongodb" },
    { name: "css", slug: "css" },
    { name: "express", slug: "express" },
    { name: "web development", slug: "web-development" },
    { name: "authentication", slug: "authentication" },
    { name: "career", slug: "career" },
];

const demoPosts = [
    {
        slug: "demo-building-your-first-rest-api-with-express",
        title: "Building Your First REST API with Express",
        author: "demo-ashish",
        tags: ["javascript", "nodejs", "express"],
        featured: true,
        daysAgo: 1,
        coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1400&q=85",
        content: `# Building Your First REST API with Express\n\nA REST API gives a frontend a predictable way to read and change data. Express helps us define those HTTP routes without writing a server from scratch.\n\n## 1. Create a small server\n\n\`\`\`js\nimport express from "express";\n\nconst app = express();\napp.use(express.json());\n\napp.get("/api/health", (req, res) => {\n  res.json({ success: true, status: "healthy" });\n});\n\napp.listen(5000, () => {\n  console.log("API is running");\n});\n\`\`\`\n\n## 2. Keep responsibilities clear\n\nRoutes describe the URL, controllers handle the request, and models work with the database. Keeping these jobs separate makes a project easier to understand and test.\n\n## 3. Test each route\n\nUse Postman to check the status code, response body and error cases. Test invalid input as carefully as successful input.\n\nA small API with predictable behaviour is a much better starting point than a large API that is difficult to debug.`,
    },
    {
        slug: "demo-understanding-javascript-async-await",
        title: "Understanding JavaScript async and await",
        author: "demo-ashish",
        tags: ["javascript", "web-development"],
        featured: true,
        daysAgo: 2,
        coverImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1400&q=85",
        content: `# Understanding JavaScript async and await\n\nJavaScript often needs to wait for work such as an API request. Promises represent a value that may become available later.\n\n## A simple example\n\n\`\`\`js\nasync function loadUser() {\n  const response = await fetch("/api/users/me");\n\n  if (!response.ok) {\n    throw new Error("Could not load the user");\n  }\n\n  return response.json();\n}\n\`\`\`\n\nThe \`await\` keyword pauses this async function until the promise settles. It does not block the entire browser.\n\n## Handle errors\n\nPut awaited work inside a \`try/catch\` block when the caller needs to show a friendly error message. Also check \`response.ok\`: fetch does not reject simply because a server returned a 404 or 500 status.\n\nUnderstanding these details makes API code easier to read and debug.`,
    },
    {
        slug: "demo-mongodb-references-vs-embedding",
        title: "MongoDB References vs Embedding: How to Choose",
        author: "demo-rahul",
        tags: ["mongodb", "web-development"],
        featured: true,
        daysAgo: 3,
        coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1400&q=85",
        content: `# MongoDB References vs Embedding\n\nMongoDB documents can contain nested data, or they can refer to another document by its ObjectId. Neither approach is always correct.\n\n## Embedding\n\nEmbedding is useful when related information is usually read together and has a clear size limit. An address inside a user profile is a common example.\n\n\`\`\`js\n{\n  name: "Priya",\n  address: { city: "Delhi", country: "India" }\n}\n\`\`\`\n\n## Referencing\n\nReferences are useful when a record is shared by many documents or has its own lifecycle. A blog post can reference its author and tags.\n\nChoose based on access patterns, update frequency and expected document size. Start with the queries your application needs to perform.`,
    },
    {
        slug: "demo-getting-started-with-react-components",
        title: "Getting Started with React Components",
        author: "demo-priya",
        tags: ["react", "javascript"],
        featured: false,
        daysAgo: 4,
        coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1400&q=85",
        content: `# Getting Started with React Components\n\nA component is a reusable piece of a user interface. A component can receive information through props and return JSX.\n\n\`\`\`jsx\nfunction WelcomeMessage({ name }) {\n  return <h2>Welcome, {name}!</h2>;\n}\n\nfunction App() {\n  return <WelcomeMessage name="Priya" />;\n}\n\`\`\`\n\nKeep components focused. A small component with one clear responsibility is usually easier for a beginner to understand than a component that handles an entire application.\n\nAs the project grows, move repeated interface pieces into reusable components and keep page-specific state close to the page that uses it.`,
    },
    {
        slug: "demo-css-grid-and-flexbox-practical-guide",
        title: "CSS Grid and Flexbox: A Practical Guide",
        author: "demo-priya",
        tags: ["css", "web-development"],
        featured: false,
        daysAgo: 5,
        coverImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1400&q=85",
        content: `# CSS Grid and Flexbox\n\nBoth Grid and Flexbox help build layouts, but they solve slightly different problems.\n\n## Flexbox\n\nFlexbox is designed for arranging items along one main axis. It works well for navigation bars, button groups and aligned card content.\n\n## Grid\n\nGrid gives you control over rows and columns together. It works well for page layouts and card galleries.\n\n\`\`\`css\n.article-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\n  gap: 1.5rem;\n}\n\`\`\`\n\nChoose the layout tool that matches the relationship between the items. They can also be used together in the same interface.`,
    },
    {
        slug: "demo-nodejs-event-loop-explained",
        title: "The Node.js Event Loop, Explained Simply",
        author: "demo-rahul",
        tags: ["nodejs", "javascript"],
        featured: false,
        daysAgo: 6,
        coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&q=85",
        content: `# The Node.js Event Loop\n\nNode.js runs JavaScript on a main thread and uses the event loop to coordinate asynchronous work. This lets a server handle many I/O operations without waiting for each one to finish before starting another.\n\n## A small example\n\n\`\`\`js\nconsole.log("First");\n\nsetTimeout(() => {\n  console.log("Timer callback");\n}, 0);\n\nconsole.log("Second");\n\`\`\`\n\nThe output is not simply the order in which the lines appear in the file. The timer callback is scheduled for later, so the synchronous logs run first.\n\nUnderstanding the event loop helps explain asynchronous APIs, timers and why blocking work can make a server unresponsive.`,
    },
    {
        slug: "demo-mongoose-validation-that-protects-your-data",
        title: "Mongoose Validation That Protects Your Data",
        author: "demo-rahul",
        tags: ["mongodb", "nodejs"],
        featured: false,
        daysAgo: 7,
        coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&q=85",
        content: `# Mongoose Validation\n\nValidation helps prevent incomplete or malformed values from being stored. It belongs in the backend because requests can come from browsers, scripts and tools such as Postman.\n\n\`\`\`js\nconst userSchema = new mongoose.Schema({\n  name: { type: String, required: true, trim: true },\n  email: { type: String, required: true, lowercase: true },\n  bio: { type: String, maxlength: 200, default: "" }\n});\n\`\`\`\n\nSchema validators are useful, but they do not replace request validation or authorization. Use all three: validate incoming data, enforce ownership, and define database constraints.`,
    },
    {
        slug: "demo-writing-clear-markdown-technical-articles",
        title: "Writing Clear Markdown for Technical Articles",
        author: "demo-ashish",
        tags: ["web-development", "javascript"],
        featured: false,
        daysAgo: 8,
        coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1400&q=85",
        content: `# Writing Clear Markdown\n\nGood technical writing helps a reader move from a question to an answer. Markdown gives writers a simple way to structure that explanation.\n\n## Use headings with a purpose\n\nHeadings should describe the section that follows. Keep paragraphs focused and explain unfamiliar terms before using them repeatedly.\n\n## Show code in fenced blocks\n\n\`\`\`js\nconst message = "Readable examples matter";\nconsole.log(message);\n\`\`\`\n\nAdding the language after the opening fence allows the article renderer to apply syntax highlighting.\n\nBefore publishing, preview links, lists, code blocks and headings. A readable article is easier to learn from and easier to maintain.`,
    },
    {
        slug: "demo-jwt-authentication-request-to-protected-route",
        title: "JWT Authentication: From Login to a Protected Route",
        author: "demo-ashish",
        tags: ["javascript", "express", "authentication"],
        featured: false,
        daysAgo: 9,
        coverImage: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1400&q=85",
        content: `# JWT Authentication\n\nAfter a successful login, a server can issue a signed JSON Web Token. The client sends that token when it calls a protected endpoint.\n\n## Request flow\n\n1. The user submits an email and password.\n2. The server compares the password with its stored hash.\n3. The server signs a token.\n4. The client stores the token and sends it in the Authorization header.\n5. Middleware verifies the token before a protected controller runs.\n\n\`\`\`http\nAuthorization: Bearer YOUR_TOKEN\n\`\`\`\n\nA token is a credential. Do not paste it into public chats, commit it to Git, or log it unnecessarily. A frontend route guard improves navigation, but the backend must still enforce authorization.`,
    },
    {
        slug: "demo-organizing-a-small-frontend-project",
        title: "Organizing a Small Frontend Project Without Overengineering",
        author: "demo-priya",
        tags: ["react", "web-development", "career"],
        featured: false,
        daysAgo: 10,
        coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400&q=85",
        content: `# Organizing a Small Frontend Project\n\nA clear folder structure should help someone find code quickly. It should not create layers that the project does not need.\n\nA practical starting point is:\n\n- \`pages/\` for route-level screens.\n- \`components/\` for reusable interface pieces.\n- \`api/\` for HTTP request functions.\n- \`context/\` for genuinely shared state.\n- \`hooks/\` for reusable React hooks.\n\nKeep names descriptive and functions small. When a file becomes difficult to understand, split it by responsibility rather than adding folders automatically.`,
    },
    {
        slug: "demo-draft-building-a-developer-portfolio",
        title: "Building a Developer Portfolio: First Draft",
        author: "demo-ashish",
        tags: ["career", "web-development"],
        featured: false,
        daysAgo: 0,
        coverImage: "",
        status: "draft",
        content: `# Building a Developer Portfolio\n\nThis is a demonstration draft. It is intentionally incomplete and should remain private until the author adds the remaining sections, a cover image and final tags.\n\n## Sections to finish\n\n- About and skills\n- Selected projects\n- Contact information\n\nDrafts must appear in the author's Dashboard but must not appear in public feeds, tag pages or public profiles.`,
    },
    {
        slug: "demo-draft-caching-strategies-with-redis",
        title: "Caching Strategies with Redis: Notes in Progress",
        author: "demo-rahul",
        tags: ["nodejs", "mongodb"],
        featured: false,
        daysAgo: 0,
        coverImage: "",
        status: "draft",
        content: `# Caching Strategies with Redis\n\nThese notes are an unfinished draft for testing private article management.\n\nThe article still needs practical examples, cache invalidation notes and a complete conclusion.`,
    },
];

const rootComments = [
    { post: demoPosts[0].slug, author: "demo-priya", content: "The separation between routes and controllers makes this much easier to follow. The small health endpoint is a helpful first test." },
    { post: demoPosts[0].slug, author: "demo-rahul", content: "I would also add one test for an invalid request body. It catches problems before the frontend is connected." },
    { post: demoPosts[1].slug, author: "demo-priya", content: "The note about fetch and response.ok is important. I made that mistake when I first started using APIs." },
    { post: demoPosts[1].slug, author: "demo-rahul", content: "A try/catch around the request makes the error path much clearer." },
    { post: demoPosts[2].slug, author: "demo-ashish", content: "The access-pattern explanation helped me decide when to use references." },
    { post: demoPosts[3].slug, author: "demo-ashish", content: "Keeping components small makes the page easier to maintain." },
    { post: demoPosts[4].slug, author: "demo-rahul", content: "Grid is my choice for card galleries, while Flexbox works nicely for the navigation." },
    { post: demoPosts[5].slug, author: "demo-priya", content: "The output example is a simple way to begin learning the event loop." },
    { post: demoPosts[6].slug, author: "demo-ashish", content: "Request validation and schema validation solve related but different problems." },
    { post: demoPosts[7].slug, author: "demo-rahul", content: "The fenced code block tip is useful. It also makes syntax highlighting easier to configure." },
    { post: demoPosts[8].slug, author: "demo-priya", content: "The frontend guard is useful for user experience, but the server must remain the authority." },
    { post: demoPosts[9].slug, author: "demo-ashish", content: "This is a good reminder not to create too many abstractions too early." },
];

const replies = [
    { parentContent: rootComments[0].content, author: "demo-ashish", content: "Agreed. I prefer to test one route at a time before adding more features." },
    { parentContent: rootComments[1].content, author: "demo-ashish", content: "Yes. Negative tests helped me find a few validation issues." },
    { parentContent: rootComments[2].content, author: "demo-ashish", content: "Exactly. A 404 response still resolves as a fetch response, so checking ok matters." },
    { parentContent: rootComments[4].content, author: "demo-rahul", content: "That is the key question: which data is read together, and how often does it change?" },
    { parentContent: rootComments[6].content, author: "demo-priya", content: "Both are useful together. A grid card can use Flexbox internally." },
    { parentContent: rootComments[8].content, author: "demo-rahul", content: "Right. The database schema adds another layer of protection, too." },
];

const follows = [
    ["demo-ashish", "demo-priya"],
    ["demo-ashish", "demo-rahul"],
    ["demo-priya", "demo-ashish"],
    ["demo-rahul", "demo-priya"],
];

const bookmarks = [
    ["demo-ashish", demoPosts[2].slug],
    ["demo-ashish", demoPosts[3].slug],
    ["demo-priya", demoPosts[0].slug],
    ["demo-priya", demoPosts[5].slug],
    ["demo-rahul", demoPosts[1].slug],
    ["demo-rahul", demoPosts[4].slug],
    ["demo-rahul", demoPosts[7].slug],
];

function getByUsername(usersByUsername, username) {
    const user = usersByUsername.get(username);
    if (!user) throw new Error(`Demo user not found: ${username}`);
    return user;
}

async function ensureDemoUser(userData) {
    let user = await User.findOne({ username: userData.username });

    if (!user) {
        const emailOwner = await User.findOne({ email: userData.email });
        if (emailOwner) {
            throw new Error(`Email ${userData.email} is already used by a different account. No existing data was changed.`);
        }
        user = new User(userData);
    } else if (user.email !== userData.email) {
        throw new Error(`Username ${userData.username} already belongs to another email. No existing data was changed.`);
    }

    user.name = userData.name;
    user.email = userData.email;
    user.password = DEMO_PASSWORD;
    user.bio = userData.bio;
    user.avatarUrl = userData.avatarUrl;
    await user.save();

    return user;
}

async function ensureDemoTag(tagData) {
    let tag = await Tag.findOne({ slug: tagData.slug });

    if (!tag) {
        tag = await Tag.findOne({ name: tagData.name });
    }

    if (!tag) {
        tag = await Tag.create(tagData);
    }

    return tag;
}

async function ensureDemoPost(postData, usersByUsername, tagsBySlug) {
    const author = getByUsername(usersByUsername, postData.author);
    const tags = postData.tags.map((slug) => {
        const tag = tagsBySlug.get(slug);
        if (!tag) throw new Error(`Demo tag not found: ${slug}`);
        return tag._id;
    });

    let post = await Post.findOne({ slug: postData.slug });

    if (post && !post.author.equals(author._id)) {
        throw new Error(`Post slug ${postData.slug} already belongs to another user. No existing post was changed.`);
    }

    if (!post) {
        post = new Post({ slug: postData.slug, author: author._id });
    }

    post.title = postData.title;
    post.content = postData.content;
    post.coverImage = postData.coverImage;
    post.status = postData.status ?? "published";
    post.tags = tags;
    post.featured = Boolean(postData.featured) && post.status === "published";
    post.publishedAt = post.status === "published"
        ? new Date(Date.now() - postData.daysAgo * 24 * 60 * 60 * 1000)
        : null;

    await post.save();
    return post;
}

async function ensureLike(userId, postId) {
    await Like.updateOne(
        { user: userId, post: postId },
        { $setOnInsert: { user: userId, post: postId } },
        { upsert: true }
    );
}

async function ensureFollow(followerId, followingId) {
    if (followerId.equals(followingId)) return;
    await Follow.updateOne(
        { follower: followerId, following: followingId },
        { $setOnInsert: { follower: followerId, following: followingId } },
        { upsert: true }
    );
}

async function ensureBookmark(userId, postId) {
    await Bookmark.updateOne(
        { user: userId, post: postId },
        { $setOnInsert: { user: userId, post: postId } },
        { upsert: true }
    );
}

async function ensureComment(postId, authorId, content, parentComment = null) {
    let comment = await Comment.findOne({ post: postId, author: authorId, content, parentComment });

    if (!comment) {
        comment = await Comment.create({ post: postId, author: authorId, content, parentComment });
    }

    return comment;
}

async function ensureCommentLike(userId, commentId) {
    await CommentLike.updateOne(
        { user: userId, comment: commentId },
        { $setOnInsert: { user: userId, comment: commentId } },
        { upsert: true }
    );
}

async function seedDatabase() {
    if (process.env.NODE_ENV === "production") {
        throw new Error("The demo data seeder is disabled in production.");
    }

    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is missing. Check server/.env before seeding.");
    }

    await connectDatabase();

    console.log("\nCreating or updating the three local demo accounts...");
    const usersByUsername = new Map();
    for (const userData of demoUsers) {
        const user = await ensureDemoUser(userData);
        usersByUsername.set(user.username, user);
    }

    console.log("Creating or reusing the demo topics...");
    const tagsBySlug = new Map();
    for (const tagData of demoTags) {
        const tag = await ensureDemoTag(tagData);
        tagsBySlug.set(tagData.slug, tag);
    }

    console.log("Creating or updating the demo articles...");
    const postsBySlug = new Map();
    for (const postData of demoPosts) {
        const post = await ensureDemoPost(postData, usersByUsername, tagsBySlug);
        postsBySlug.set(post.slug, post);
    }

    console.log("Adding article likes, follows and bookmarks...");
    for (const postData of demoPosts.filter((post) => (post.status ?? "published") === "published")) {
        const post = postsBySlug.get(postData.slug);
        for (const userData of demoUsers) {
            if (userData.username !== postData.author) {
                await ensureLike(getByUsername(usersByUsername, userData.username)._id, post._id);
            }
        }
    }

    for (const [followerName, followingName] of follows) {
        await ensureFollow(
            getByUsername(usersByUsername, followerName)._id,
            getByUsername(usersByUsername, followingName)._id
        );
    }

    for (const [username, postSlug] of bookmarks) {
        await ensureBookmark(
            getByUsername(usersByUsername, username)._id,
            postsBySlug.get(postSlug)._id
        );
    }

    console.log("Adding comments, replies and comment likes...");
    const commentsByContent = new Map();
    for (const commentData of rootComments) {
        const post = postsBySlug.get(commentData.post);
        const author = getByUsername(usersByUsername, commentData.author);
        const comment = await ensureComment(post._id, author._id, commentData.content);
        commentsByContent.set(commentData.content, comment);
    }

    for (const replyData of replies) {
        const parent = commentsByContent.get(replyData.parentContent);
        if (!parent) throw new Error(`Reply parent was not found: ${replyData.parentContent}`);
        const author = getByUsername(usersByUsername, replyData.author);
        const reply = await ensureComment(parent.post, author._id, replyData.content, parent._id);
        commentsByContent.set(replyData.content, reply);
    }

    const commentLikes = [
        ["demo-ashish", rootComments[0].content],
        ["demo-rahul", rootComments[0].content],
        ["demo-priya", rootComments[1].content],
        ["demo-priya", rootComments[4].content],
        ["demo-ashish", rootComments[6].content],
        ["demo-priya", replies[0].content],
        ["demo-rahul", replies[2].content],
    ];

    for (const [username, content] of commentLikes) {
        const comment = commentsByContent.get(content);
        await ensureCommentLike(getByUsername(usersByUsername, username)._id, comment._id);
    }

    const publishedCount = demoPosts.filter((post) => (post.status ?? "published") === "published").length;
    const draftCount = demoPosts.length - publishedCount;

    console.log("\nDemo data is ready.");
    console.log("----------------------------------------");
    console.log(`Demo users:       ${demoUsers.length}`);
    console.log(`Demo tags:        ${demoTags.length} (existing matching tags are reused)`);
    console.log(`Demo articles:    ${demoPosts.length} (${publishedCount} published, ${draftCount} drafts)`);
    console.log(`Top-level comments: ${rootComments.length}`);
    console.log(`Replies:            ${replies.length}`);
    console.log("Article likes:    seeded for each published article by the two non-author demo users");
    console.log(`Follows:          ${follows.length}`);
    console.log(`Bookmarks:        ${bookmarks.length}`);
    console.log("----------------------------------------\n");
    console.log("LOCAL DEMO LOGIN DETAILS");
    console.log("All three accounts use the same development-only password:");
    console.log(`Password: ${DEMO_PASSWORD}\n`);
    for (const user of demoUsers) {
        console.log(`${user.name}: ${user.email}  (@${user.username})`);
    }
    console.log("\nRun this command again safely: existing demo records are reused, not duplicated.");
    console.log("The script does not delete existing users, posts, tags or interactions.\n");
}

seedDatabase()
    .catch((error) => {
        console.error("\nCould not seed the demo database:");
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await disconnectDatabase();
    });
