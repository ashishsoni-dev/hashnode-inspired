import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import diff from "react-syntax-highlighter/dist/esm/languages/prism/diff";
import PostSidebar from "../components/post/PostSidebar";
import { getPostBySlug } from "../api/postsApi";
import { getPostComments, addComment, updateComment, deleteComment, likeComment, unlikeComment } from "../api/commentsApi";
import { likePost, unlikePost, bookmarkPost, unbookmarkPost } from "../api/interactionsApi";
import { getErrorMessage } from "../api/axios";
import { getPostTags } from "../utils/postTags";
import { useAuth } from "../hooks/useAuth";

SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("markup", markup);
SyntaxHighlighter.registerLanguage("html", markup);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("yaml", yaml);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("diff", diff);

function formatDate(value) {
    if (!value) return "";
    return new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function PostPage() {
    const { slug } = useParams();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [post, setPost] = useState(null);
    const [postLoadError, setPostLoadError] = useState("");
    const [comments, setComments] = useState([]);
    const [commentPagination, setCommentPagination] = useState(null);
    const [commentPage, setCommentPage] = useState(1);
    const [loadedPostKey, setLoadedPostKey] = useState(null);
    const [loadedCommentsKey, setLoadedCommentsKey] = useState(null);
    const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isSavingInteraction, setIsSavingInteraction] = useState(false);
    const [interactionError, setInteractionError] = useState("");
    const [shareMessage, setShareMessage] = useState("");
    const [commentInput, setCommentInput] = useState("");
    const [replyInputs, setReplyInputs] = useState({});
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [visibleCommentCount, setVisibleCommentCount] = useState(3);
    const [expandedReplies, setExpandedReplies] = useState({});
    const [commentError, setCommentError] = useState("");
    const [commentBusy, setCommentBusy] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState("");
    const postKey = `${slug}:${isAuthenticated}`;
    const isLoading = loadedPostKey !== postKey;

    useEffect(() => {
        let isCurrent = true;

        async function loadPost() {
            try {
                const article = await getPostBySlug(slug);
                if (isCurrent) {
                    setPost(article);
                    setIsLiked(Boolean(article.isLiked));
                    setIsBookmarked(Boolean(article.isBookmarked));
                    setPostLoadError("");
                }
            } catch (loadError) {
                if (isCurrent) {
                    setPost(null);
                    setPostLoadError(getErrorMessage(loadError, "Could not load this article."));
                }
            } finally {
                if (isCurrent) setLoadedPostKey(postKey);
            }
        }

        loadPost();
        return () => { isCurrent = false; };
    }, [slug, isAuthenticated, postKey]);

    const commentsRequestKey = post?.id ? `${post.id}:${isAuthenticated}` : null;
    const commentsLoading = (Boolean(commentsRequestKey) && loadedCommentsKey !== commentsRequestKey)
        || isLoadingMoreComments;
    const commentsAreCurrent = loadedCommentsKey === commentsRequestKey;
    const currentComments = commentsAreCurrent ? comments : [];
    const currentCommentPagination = commentsAreCurrent ? commentPagination : null;
    const visibleCommentError = commentsAreCurrent ? commentError : "";

    useEffect(() => {
        if (!post?.id) return undefined;
        let isCurrent = true;

        async function loadComments() {
            try {
                const result = await getPostComments(post.id, 1);
                if (isCurrent) {
                    setComments(result.comments);
                    setCommentPagination(result.pagination);
                    setCommentPage(1);
                    setVisibleCommentCount(3);
                    setCommentError("");
                }
            } catch (loadError) {
                if (isCurrent) setCommentError(getErrorMessage(loadError, "Could not load comments."));
            } finally {
                if (isCurrent) setLoadedCommentsKey(commentsRequestKey);
            }
        }

        loadComments();
        return () => { isCurrent = false; };
    }, [post?.id, isAuthenticated, commentsRequestKey]);

    function askUserToLogin() {
        navigate("/login", { state: { from: location } });
    }

    function updateCommentInList(commentId, changes) {
        setComments((current) => current.map((comment) => {
            if (comment.id === commentId) return { ...comment, ...changes };
            return {
                ...comment,
                replies: (comment.replies || []).map((reply) =>
                    reply.id === commentId ? { ...reply, ...changes } : reply
                ),
            };
        }));
    }

    async function handlePostLike() {
        if (!isAuthenticated) return askUserToLogin();
        if (isSavingInteraction) return;
        setIsSavingInteraction(true);
        setInteractionError("");
        try {
            const result = await (isLiked ? unlikePost(post.id) : likePost(post.id));
            setIsLiked(result.isLiked);
            setPost((current) => ({ ...current, likes: result.likesCount, likesCount: result.likesCount }));
        } catch (error) {
            setInteractionError(getErrorMessage(error, "Could not update your like."));
        } finally {
            setIsSavingInteraction(false);
        }
    }

    async function handleBookmark() {
        if (!isAuthenticated) return askUserToLogin();
        if (isSavingInteraction) return;
        setIsSavingInteraction(true);
        setInteractionError("");
        try {
            const result = await (isBookmarked ? unbookmarkPost(post.id) : bookmarkPost(post.id));
            setIsBookmarked(result.isBookmarked);
            setPost((current) => ({ ...current, bookmarks: result.bookmarksCount, bookmarksCount: result.bookmarksCount }));
        } catch (error) {
            setInteractionError(getErrorMessage(error, "Could not update your bookmark."));
        } finally {
            setIsSavingInteraction(false);
        }
    }

    async function handleShare() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setShareMessage("Link copied to clipboard.");
        } catch {
            setShareMessage("Copying is not available in this browser.");
        }
    }

    async function handleAddComment(event) {
        event.preventDefault();
        if (!isAuthenticated) return askUserToLogin();
        const content = commentInput.trim();
        if (!content) return setCommentError("Write a comment before submitting.");
        if (content.length > 1000) return setCommentError("Comments must be 1,000 characters or fewer.");

        setCommentBusy(true);
        setCommentError("");
        try {
            const newComment = await addComment(post.id, content);
            setComments((current) => [...current, { ...newComment, replies: [] }]);
            setCommentInput("");
            setVisibleCommentCount((current) => Math.max(current, currentComments.length + 1));
            setPost((current) => ({ ...current, commentCount: (current.commentCount || 0) + 1 }));
        } catch (error) {
            setCommentError(getErrorMessage(error, "Could not post your comment."));
        } finally {
            setCommentBusy(false);
        }
    }

    async function handleReply(event, parentCommentId) {
        event.preventDefault();
        if (!isAuthenticated) return askUserToLogin();
        const content = (replyInputs[parentCommentId] || "").trim();
        if (!content) return;
        if (content.length > 1000) return setCommentError("Replies must be 1,000 characters or fewer.");

        setCommentBusy(true);
        setCommentError("");
        try {
            const reply = await addComment(post.id, content, parentCommentId);
            setComments((current) => current.map((comment) =>
                comment.id === parentCommentId
                    ? { ...comment, replies: [...(comment.replies || []), reply] }
                    : comment
            ));
            setReplyInputs((current) => ({ ...current, [parentCommentId]: "" }));
            setExpandedReplies((current) => ({ ...current, [parentCommentId]: true }));
            setActiveReplyId(null);
        } catch (error) {
            setCommentError(getErrorMessage(error, "Could not post your reply."));
        } finally {
            setCommentBusy(false);
        }
    }

    async function handleCommentLike(comment) {
        if (!isAuthenticated) return askUserToLogin();
        try {
            const result = await (comment.isLiked ? unlikeComment(comment.id) : likeComment(comment.id));
            updateCommentInList(comment.id, { isLiked: result.isLiked, likes: result.likes });
        } catch (error) {
            setCommentError(getErrorMessage(error, "Could not update the comment like."));
        }
    }

    function startEditingComment(comment) {
        setEditingCommentId(comment.id);
        setEditingCommentText(comment.content);
    }

    async function saveEditedComment(commentId) {
        const content = editingCommentText.trim();
        if (!content) return setCommentError("Comment cannot be empty.");
        if (content.length > 1000) return setCommentError("Comments must be 1,000 characters or fewer.");

        try {
            const updated = await updateComment(commentId, content);
            updateCommentInList(commentId, { content: updated.content, updatedAt: updated.updatedAt });
            setEditingCommentId(null);
            setEditingCommentText("");
            setCommentError("");
        } catch (error) {
            setCommentError(getErrorMessage(error, "Could not update your comment."));
        }
    }

    async function handleDeleteComment(commentId) {
        if (!window.confirm("Delete this comment?")) return;
        const isTopLevelComment = currentComments.some((comment) => comment.id === commentId);
        try {
            await deleteComment(commentId);
            setComments((current) => current
                .filter((comment) => comment.id !== commentId)
                .map((comment) => ({
                    ...comment,
                    replies: (comment.replies || []).filter((reply) => reply.id !== commentId),
                })));
            if (isTopLevelComment) {
                setPost((current) => ({ ...current, commentCount: Math.max(0, (current.commentCount || 0) - 1) }));
            }
        } catch (error) {
            setCommentError(getErrorMessage(error, "Could not delete your comment."));
        }
    }

    async function loadMoreComments() {
        if (visibleCommentCount < currentComments.length) {
            setVisibleCommentCount((current) => current + 3);
            return;
        }

        if (!currentCommentPagination?.hasNextPage || isLoadingMoreComments) return;
        setIsLoadingMoreComments(true);
        try {
            const nextPage = commentPage + 1;
            const result = await getPostComments(post.id, nextPage);
            setComments((current) => [...current, ...result.comments]);
            setCommentPagination(result.pagination);
            setCommentPage(nextPage);
            setVisibleCommentCount((current) => current + 3);
        } catch (error) {
            setCommentError(getErrorMessage(error, "Could not load more comments."));
        } finally {
            setIsLoadingMoreComments(false);
        }
    }

    if (isLoading) {
        return <div className="container"><p role="status">Loading article...</p></div>;
    }

    if (!post) {
        return (
            <div className="container">
                <h1>Article not found</h1>
                <p>{postLoadError || "This article may have been removed or is not publicly available."}</p>
                <Link to="/">Back to home</Link>
            </div>
        );
    }

    const postTags = getPostTags(post);
    const visibleComments = currentComments.slice(0, visibleCommentCount);

    return (
        <div className="container post-layout">
            <article className="post-page">
                <Link to="/" className="post-page__back">← Back to home</Link>

                <p className="post-page__author">
                    By{" "}
                    {post.authorProfile ? (
                        <Link to={`/profile/${post.authorProfile.username || post.authorProfile.id}`}>
                            {post.authorProfile.name || post.author}
                        </Link>
                    ) : post.author}
                </p>

                <h1>{post.title}</h1>
                <p className="post-page__description">{post.description || post.excerpt}</p>

                <div className="post-page__meta">
                    <div className="post-page__tags" aria-label="Article tags">
                        {postTags.map((tag) => (
                            <Link key={tag.slug} to={`/tag/${tag.slug}`} className="post-page__tag">#{tag.name}</Link>
                        ))}
                    </div>
                    <span>{post.readTime} min read</span>
                    <time className="post-page__date" dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                </div>

                {post.thumbnail && <img className="post-page__cover" src={post.thumbnail} alt={post.title} />}
                <hr />

                <div className="post-page__content">
                    <ReactMarkdown
                        components={{
                            h1({ children, ...props }) {
                                if (String(children).trim() === post.title) return null;
                                return <h1 {...props}>{children}</h1>;
                            },
                            code({ children, className, ...props }) {
                                const match = /language-([\w-]+)/.exec(className || "");
                                if (!match) return <code className={className} {...props}>{children}</code>;

                                const aliases = { js: "javascript", ts: "typescript", sh: "bash", shell: "bash", yml: "yaml", md: "markdown" };
                                const language = aliases[match[1].toLowerCase()] || match[1].toLowerCase();
                                const code = String(children).replace(/\n$/, "");
                                const supportedLanguages = ["javascript", "jsx", "css", "markup", "html", "json", "typescript", "tsx", "python", "bash", "sql", "yaml", "markdown", "diff"];

                                if (supportedLanguages.includes(language)) {
                                    return (
                                        <SyntaxHighlighter
                                            language={language === "html" ? "markup" : language}
                                            style={oneDark}
                                            PreTag="div"
                                            customStyle={{ margin: "1.25rem 0", borderRadius: "12px", padding: "1.25rem", fontSize: "0.875rem", lineHeight: 1.7 }}
                                            wrapLongLines={false}
                                        >
                                            {code}
                                        </SyntaxHighlighter>
                                    );
                                }

                                return <pre className="post-page__code-block"><code>{code}</code></pre>;
                            },
                        }}
                    >
                        {post.content || "Article content is coming soon."}
                    </ReactMarkdown>
                </div>

                <div className="post-interactions">
                    <button type="button" className={`post-interactions__button ${isLiked ? "is-active" : ""}`} onClick={handlePostLike} disabled={isSavingInteraction} aria-pressed={isLiked}>
                        <span aria-hidden="true">♥</span><span>{isLiked ? "Liked" : "Like"}</span><strong>{post.likesCount ?? post.likes ?? 0}</strong>
                    </button>
                    <button type="button" className={`post-interactions__button ${isBookmarked ? "is-active" : ""}`} onClick={handleBookmark} disabled={isSavingInteraction} aria-pressed={isBookmarked}>
                        <span aria-hidden="true">▣</span><span>{isBookmarked ? "Saved" : "Bookmark"}</span>
                    </button>
                    <button type="button" className="post-interactions__button" onClick={() => document.getElementById("post-comments")?.scrollIntoView({ behavior: "smooth" })}>
                        <span aria-hidden="true">◌</span><span>Comments</span><strong>{post.commentCount || 0}</strong>
                    </button>
                    <button type="button" className="post-interactions__button" onClick={handleShare}>
                        <span aria-hidden="true">↗</span><span>Share</span>
                    </button>
                </div>
                {interactionError && (
                    <p className="post-interactions__error" role="alert">{interactionError}</p>
                )}
                {shareMessage && <p role="status">{shareMessage}</p>}

                <section id="post-comments" className="post-comments" aria-labelledby="post-comments-title">
                    <h2 id="post-comments-title">Comments ({post.commentCount ?? currentComments.length})</h2>

                    <form className="post-comment-form" onSubmit={handleAddComment}>
                        <textarea
                            value={commentInput}
                            className="post-comment-form__input"
                            onChange={(event) => setCommentInput(event.target.value)}
                            placeholder={isAuthenticated ? "Share your thoughts..." : "Log in to join the discussion..."}
                            rows={3}
                            maxLength={1000}
                            aria-label="Write a comment"
                        />
                        <div className="post-comment-form__footer">
                            <span>{commentInput.length}/1000 characters</span>
                            <button type="submit" disabled={commentBusy || !commentInput.trim()}>{commentBusy ? "Posting..." : "Post comment"}</button>
                        </div>
                    </form>

                    {visibleCommentError && <p className="post-comments__error" role="alert">{visibleCommentError}</p>}

                    {commentsLoading && currentComments.length === 0 ? (
                        <p role="status">Loading comments...</p>
                    ) : currentComments.length === 0 && visibleCommentError ? (
                        <div className="post-comments__empty"><p>Comments could not be loaded. Please try again later.</p></div>
                    ) : currentComments.length === 0 ? (
                        <div className="post-comments__empty"><p>No comments yet. Start the conversation.</p></div>
                    ) : (
                        <div className="post-comments__list">
                            {visibleComments.map((comment) => {
                                const canEdit = isAuthenticated && user?.id === comment.author?.id;

                                return (
                                    <article key={comment.id} className="post-comment">
                                        <div className="post-comment__header">
                                            <strong>{comment.author?.name || comment.userId}</strong>
                                            <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
                                        </div>

                                        {editingCommentId === comment.id ? (
                                            <div className="post-comment__edit">
                                                <textarea value={editingCommentText} onChange={(event) => setEditingCommentText(event.target.value)} maxLength={1000} rows={3} />
                                                <button type="button" onClick={() => saveEditedComment(comment.id)}>Save</button>
                                                <button type="button" onClick={() => setEditingCommentId(null)}>Cancel</button>
                                            </div>
                                        ) : (
                                            <p className="post-comment__content">{comment.content}</p>
                                        )}

                                        <div className="post-comment__actions">
                                            <button type="button" className="post-comment__likes" onClick={() => handleCommentLike(comment)} aria-pressed={Boolean(comment.isLiked)}>
                                                ♥ {comment.likes || 0}
                                            </button>
                                            {isAuthenticated && <button type="button" className="post-comment__reply-button" onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}>Reply</button>}
                                            {canEdit && editingCommentId !== comment.id && <button type="button" onClick={() => startEditingComment(comment)}>Edit</button>}
                                            {canEdit && <button type="button" onClick={() => handleDeleteComment(comment.id)}>Delete</button>}
                                        </div>

                                        {activeReplyId === comment.id && (
                                            <form className="post-reply-form" onSubmit={(event) => handleReply(event, comment.id)}>
                                                <textarea value={replyInputs[comment.id] || ""} onChange={(event) => setReplyInputs((current) => ({ ...current, [comment.id]: event.target.value }))} placeholder="Write a reply..." rows={2} maxLength={1000} aria-label={`Reply to ${comment.author?.name || comment.userId}`} />
                                                <button type="submit" disabled={commentBusy || !(replyInputs[comment.id] || "").trim()}>{commentBusy ? "Posting..." : "Post reply"}</button>
                                            </form>
                                        )}

                                        {comment.replies?.length > 0 && (
                                            <>
                                                <button type="button" className="post-comment__replies-toggle" onClick={() => setExpandedReplies((current) => ({ ...current, [comment.id]: !current[comment.id] }))} aria-expanded={Boolean(expandedReplies[comment.id])}>
                                                    {expandedReplies[comment.id] ? "Hide replies" : `Show replies (${comment.replies.length})`}
                                                </button>

                                                {expandedReplies[comment.id] && (
                                                    <div className="post-comment__replies">
                                                        {comment.replies.map((reply) => {
                                                            const canEditReply = isAuthenticated && user?.id === reply.author?.id;
                                                            return (
                                                                <article key={reply.id} className="post-reply">
                                                                    <div className="post-comment__header">
                                                                        <strong>{reply.author?.name || reply.userId}</strong>
                                                                        <time dateTime={reply.createdAt}>{formatDate(reply.createdAt)}</time>
                                                                    </div>
                                                                    {editingCommentId === reply.id ? (
                                                                        <div className="post-comment__edit">
                                                                            <textarea value={editingCommentText} onChange={(event) => setEditingCommentText(event.target.value)} maxLength={1000} rows={2} />
                                                                            <button type="button" onClick={() => saveEditedComment(reply.id)}>Save</button>
                                                                            <button type="button" onClick={() => setEditingCommentId(null)}>Cancel</button>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="post-comment__content">{reply.content}</p>
                                                                    )}
                                                                    <div className="post-comment__actions">
                                                                        <button type="button" className="post-comment__likes" onClick={() => handleCommentLike(reply)} aria-pressed={Boolean(reply.isLiked)}>♥ {reply.likes || 0}</button>
                                                                        {canEditReply && editingCommentId !== reply.id && <button type="button" onClick={() => startEditingComment(reply)}>Edit</button>}
                                                                        {canEditReply && <button type="button" onClick={() => handleDeleteComment(reply.id)}>Delete</button>}
                                                                    </div>
                                                                </article>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </article>
                                );
                            })}

                            {(visibleCommentCount < currentComments.length || currentCommentPagination?.hasNextPage) && (
                                <button type="button" className="post-comments__load-more" onClick={loadMoreComments} disabled={commentsLoading}>
                                    {commentsLoading ? "Loading..." : "Load more comments"}
                                </button>
                            )}
                        </div>
                    )}
                </section>
            </article>

            <PostSidebar post={post} />
        </div>
    );
}

export default PostPage;
