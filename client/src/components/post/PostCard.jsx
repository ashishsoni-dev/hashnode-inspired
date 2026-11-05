import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getPostTags } from "../../utils/postTags";
import { likePost, unlikePost, bookmarkPost, unbookmarkPost } from "../../api/interactionsApi";
import { getErrorMessage } from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";

function HeartIcon({ filled = false }) {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
        </svg>
    );
}

function BookmarkIcon({ filled = false }) {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-4-6 4V4.75Z" />
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17 17 7M7 7h10v10" />
        </svg>
    );
}

function formatDate(value) {
    if (!value) return "";
    return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function PostCard({ post, onBookmarkChange }) {
    const { isAuthenticated } = useAuth();

    return (
        <PostCardContent
            key={`${post.id}-${isAuthenticated}`}
            post={post}
            onBookmarkChange={onBookmarkChange}
            isAuthenticated={isAuthenticated}
        />
    );
}

function PostCardContent({ post, onBookmarkChange, isAuthenticated }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [liked, setLiked] = useState(Boolean(post.isLiked));
    const [bookmarked, setBookmarked] = useState(Boolean(post.isBookmarked));
    const [likeCount, setLikeCount] = useState(post.likesCount ?? post.likes ?? 0);
    const [isBusy, setIsBusy] = useState(false);
    const [error, setError] = useState("");

    function stopCardClick(event) {
        event.stopPropagation();
    }

    function askForLogin() {
        navigate("/login", { state: { from: location } });
    }

    async function handleLike(event) {
        stopCardClick(event);
        if (!isAuthenticated) return askForLogin();
        if (isBusy) return;

        setIsBusy(true);
        setError("");
        try {
            const result = await (liked ? unlikePost(post.id) : likePost(post.id));
            setLiked(result.isLiked);
            setLikeCount(result.likesCount);
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Could not update your like."));
        } finally {
            setIsBusy(false);
        }
    }

    async function handleBookmark(event) {
        stopCardClick(event);
        if (!isAuthenticated) return askForLogin();
        if (isBusy) return;

        setIsBusy(true);
        setError("");
        try {
            const result = await (bookmarked ? unbookmarkPost(post.id) : bookmarkPost(post.id));
            setBookmarked(result.isBookmarked);
            onBookmarkChange?.(result.isBookmarked);
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Could not update your bookmark."));
        } finally {
            setIsBusy(false);
        }
    }

    const authorName = post.author || post.authorProfile?.name || "Community author";

    return (
        <article
            className="post-card"
            onClick={(event) => {
                if (event.target.closest("a, button")) return;
                navigate(`/post/${post.slug}`);
            }}
            onKeyDown={(event) => {
                if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    navigate(`/post/${post.slug}`);
                }
            }}
            tabIndex={0}
            aria-label={`Read article: ${post.title}`}
        >
            <Link to={`/post/${post.slug}`} className="post-card__thumbnail-link" aria-label={`Read ${post.title}`}>
                {post.thumbnail ? (
                    <img className="post-card__thumbnail" src={post.thumbnail} alt="" loading="lazy" />
                ) : (
                    <div className="post-card__thumbnail post-card__thumbnail--placeholder" aria-hidden="true"><span>{"</>"}</span></div>
                )}
            </Link>

            <div className="post-card__body">
                <div className="post-card__top">
                    <div className="post-card__author">
                        {post.authorProfile?.avatarUrl ? (
                            <img className="post-card__avatar" src={post.authorProfile.avatarUrl} alt="" />
                        ) : (
                            <span className="post-card__avatar" aria-hidden="true">{authorName.charAt(0).toUpperCase()}</span>
                        )}

                        <div className="post-card__byline">
                            {post.authorId ? (
                                <Link to={`/profile/${post.authorId}`} className="post-card__author-name" onClick={stopCardClick}>{authorName}</Link>
                            ) : (
                                <span className="post-card__author-name">{authorName}</span>
                            )}
                            <span className="post-card__read-time">{post.readTime || 1} min read</span>
                        </div>
                    </div>

                    <button type="button" className={`post-card__bookmark ${bookmarked ? "is-active" : ""}`} onClick={handleBookmark} disabled={isBusy} aria-label={bookmarked ? "Remove bookmark" : "Bookmark article"} aria-pressed={bookmarked} title={bookmarked ? "Remove bookmark" : "Bookmark article"}>
                        <BookmarkIcon filled={bookmarked} />
                    </button>
                </div>

                <Link to={`/post/${post.slug}`} className="post-card__title"><h3>{post.title}</h3></Link>
                <p className="post-card__description">{post.description || post.excerpt || "Read the full article to explore this topic."}</p>

                <div className="post-card__footer">
                    <div className="post-card__tags">
                        {getPostTags(post).map((tag) => (
                            <Link key={tag.slug} to={`/tag/${tag.slug}`} className="post-card__tag" onClick={stopCardClick}>
                                <span aria-hidden="true">#</span>{tag.name}
                            </Link>
                        ))}
                    </div>
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                </div>

                <div className="post-card__engagement">
                    <button type="button" className={`post-card__like ${liked ? "is-active" : ""}`} onClick={handleLike} disabled={isBusy} aria-label={liked ? "Unlike article" : "Like article"} aria-pressed={liked}>
                        <HeartIcon filled={liked} /><span>{likeCount}</span>
                    </button>
                    <Link to={`/post/${post.slug}`} className="post-card__read-link">Read article <ArrowIcon /></Link>
                </div>
                {error && <p className="post-card__error" role="alert">{error}</p>}
            </div>
        </article>
    );
}

export default PostCard;
