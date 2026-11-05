import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getPublicProfile, followUser, unfollowUser } from "../../api/usersApi";
import { getPosts } from "../../api/postsApi";
import { getTags } from "../../api/tagsApi";
import { getErrorMessage } from "../../api/axios";
import { getPostTags } from "../../utils/postTags";
import { useAuth } from "../../hooks/useAuth";

function PostSidebar({ post }) {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [author, setAuthor] = useState(post.authorProfile || null);
    const [authorPosts, setAuthorPosts] = useState([]);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [topics, setTopics] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [error, setError] = useState("");
    const firstTag = getPostTags(post)[0]?.slug;

    useEffect(() => {
        let isCurrent = true;

        async function loadSidebar() {
            try {
                const [profileResult, relatedResult, availableTags] = await Promise.all([
                    post.authorId ? getPublicProfile(post.authorId, { page: 1, limit: 4 }) : Promise.resolve(null),
                    firstTag ? getPosts({ page: 1, limit: 4, tag: firstTag }) : getPosts({ page: 1, limit: 4 }),
                    getTags(),
                ]);

                if (!isCurrent) return;

                if (profileResult) {
                    setAuthor(profileResult.user);
                    setAuthorPosts(profileResult.posts.filter((item) => item.id !== post.id).slice(0, 3));
                    setIsFollowing(Boolean(profileResult.user.isFollowing));
                }

                setRelatedPosts(relatedResult.posts.filter((item) => item.id !== post.id).slice(0, 3));
                setTopics(availableTags.slice(0, 10));
            } catch (loadError) {
                if (isCurrent) setError(getErrorMessage(loadError, "Some sidebar information could not be loaded."));
            }
        }

        loadSidebar();
        return () => { isCurrent = false; };
    }, [post.id, post.authorId, firstTag, isAuthenticated]);

    async function handleFollow() {
        if (!isAuthenticated) {
            navigate("/login", { state: { from: location } });
            return;
        }

        try {
            const result = await (isFollowing ? unfollowUser(author.username) : followUser(author.username));
            setIsFollowing(result.following);
            setAuthor((current) => ({ ...current, followers: result.followers }));
        } catch (followError) {
            setError(getErrorMessage(followError, "Could not update follow status."));
        }
    }

    return (
        <aside className="post-sidebar">
            {error && <p role="alert">{error}</p>}

            <section className="post-sidebar__card">
                <h2>About the Author</h2>
                {author && (
                    <>
                        <Link to={`/profile/${author.username || author.id}`} className="post-sidebar__author-profile" aria-label={`View ${author.name}'s profile`}>
                            {author.avatarUrl ? (
                                <img className="post-sidebar__avatar" src={author.avatarUrl} alt="" />
                            ) : (
                                <span className="post-sidebar__avatar" aria-hidden="true">{author.name?.charAt(0)?.toUpperCase()}</span>
                            )}
                            <h3>{author.name}</h3>
                        </Link>
                        <p>{author.bio || "This author has not added a bio yet."}</p>
                        <p className="post-sidebar__followers">
                            <strong>{new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(author.followers ?? 0)}</strong> followers
                        </p>
                        {user?.id !== author.id && (
                            <button
                                type="button"
                                className={`post-sidebar__follow post-sidebar__follow--${isFollowing ? "following" : "follow"}`}
                                onClick={handleFollow}
                                aria-label={`${isFollowing ? "Unfollow" : "Follow"} ${author.name}`}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </button>
                        )}
                    </>
                )}
            </section>

            <section className="post-sidebar__card">
                <h2>More from This Author</h2>
                {authorPosts.length > 0 ? (
                    <div className="post-sidebar__articles-list">
                        {authorPosts.map((item) => (
                            <Link key={item.id} to={`/post/${item.slug}`} className="post-sidebar__article">
                                {item.thumbnail && <img src={item.thumbnail} alt="" />}
                                <span>{item.title}</span>
                                <small>{item.readTime} min read</small>
                            </Link>
                        ))}
                    </div>
                ) : <p>No other articles from this author yet.</p>}
            </section>

            <section className="post-sidebar__card">
                <div className="post-sidebar__section-header">
                    <h2>Related Articles</h2>
                    <span className="post-sidebar__section-count">{relatedPosts.length}</span>
                </div>
                <div className="post-sidebar__related-list">
                    {relatedPosts.map((item) => (
                        <Link key={item.id} to={`/post/${item.slug}`} className="post-sidebar__related-item">
                            {item.thumbnail && <img src={item.thumbnail} alt="" className="post-sidebar__related-image" />}
                            <div className="post-sidebar__related-details">
                                <span className="post-sidebar__topic-badge">{item.tag}</span>
                                <h3>{item.title}</h3>
                                <small>{item.readTime} min read</small>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="post-sidebar__card">
                <div className="post-sidebar__section-header">
                    <h2>Explore Topics</h2>
                    <span className="post-sidebar__section-count">{topics.length}</span>
                </div>
                <div className="post-sidebar__topics">
                    {topics.map((topic) => (
                        <Link key={topic.slug} to={`/tag/${topic.slug}`} className="post-sidebar__topic">
                            <span>{topic.name}</span>
                            <span className="post-sidebar__topic-count">{topic.count}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {!isAuthenticated && (
                <section className="post-sidebar__card post-sidebar__card--community">
                    <h2>Join the Community</h2>
                    <p>Join our community of developers and writers.</p>
                    <Link to="/register">Create an account →</Link>
                </section>
            )}
        </aside>
    );
}

export default PostSidebar;
