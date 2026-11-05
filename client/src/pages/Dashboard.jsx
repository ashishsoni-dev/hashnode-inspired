
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deletePost, getMyPosts } from "../api/postsApi";
import { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";

function formatDate(value) {
    if (!value) return "Not published yet";

    return new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function Dashboard() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [activeFilter, setActiveFilter] = useState("all");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [feedback, setFeedback] = useState(
        location.state?.editorFeedback ?? ""
    );
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let isCurrent = true;

        async function loadPosts() {
            try {
                const myPosts = await getMyPosts();

                if (isCurrent) {
                    setPosts(myPosts);
                    setError("");
                }
            } catch (loadError) {
                if (isCurrent) {
                    setError(
                        getErrorMessage(
                            loadError,
                            "Could not load your articles."
                        )
                    );
                }
            } finally {
                if (isCurrent) {
                    setIsLoading(false);
                }
            }
        }

        loadPosts();

        return () => {
            isCurrent = false;
        };
    }, []);

    useEffect(() => {
        if (!location.state?.editorFeedback) return;

        navigate(location.pathname, {
            replace: true,
            state: null,
        });
    }, [location.pathname, location.state, navigate]);

    const firstName = user?.name?.trim().split(/\s+/)[0] || "Writer";

    const publishedCount = useMemo(
        () => posts.filter((post) => post.status === "published").length,
        [posts]
    );

    const draftCount = posts.length - publishedCount;

    const filteredPosts = posts.filter(
        (post) =>
            activeFilter === "all" ||
            post.status === activeFilter
    );

    const hasPostLoadError = !isLoading && Boolean(error) && posts.length === 0;

    async function handleDelete() {
        if (!deleteTarget) return;

        setIsDeleting(true);
        setError("");

        try {
            await deletePost(deleteTarget.id);

            setPosts((current) =>
                current.filter((post) => post.id !== deleteTarget.id)
            );

            setFeedback(
                `"${deleteTarget.title || "Untitled draft"}" was deleted.`
            );

            setDeleteTarget(null);
        } catch (deleteError) {
            setError(
                getErrorMessage(
                    deleteError,
                    "Could not delete this article."
                )
            );
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="container dashboard-page">
            <header className="dashboard-page__header">
                <div>
                    <p className="dashboard-page__eyebrow">
                        YOUR CREATOR WORKSPACE
                    </p>

                    <h1>Welcome back, {firstName}!</h1>

                    <p>
                        Your ideas deserve to be read. Manage your articles,
                        continue writing, and share your knowledge.
                    </p>
                </div>

                <div className="dashboard-page__header-actions">
                    <Link
                        to="/settings"
                        className="dashboard-page__profile-link"
                    >
                        <span aria-hidden="true">⚙</span> Edit profile
                    </Link>

                    <Link
                        to="/editor/new"
                        className="dashboard-page__create"
                    >
                        <span aria-hidden="true">＋</span> Write an article
                    </Link>
                </div>
            </header>

            {!isLoading && !hasPostLoadError && (
                <section
                    className="dashboard-stats"
                    aria-label="Article statistics"
                >
                    <article className="dashboard-stat">
                        <span>Total articles</span>
                        <strong>{posts.length}</strong>
                    </article>

                    <article className="dashboard-stat">
                        <span>Published</span>
                        <strong>{publishedCount}</strong>
                    </article>

                    <article className="dashboard-stat">
                        <span>Drafts</span>
                        <strong>{draftCount}</strong>
                    </article>
                </section>
            )}

            <section
                className="dashboard-welcome"
                aria-label="Author profile summary"
            >
                {user?.avatarUrl ? (
                    <img
                        className="dashboard-welcome__avatar"
                        src={user.avatarUrl}
                        alt=""
                    />
                ) : (
                    <div
                        className="dashboard-welcome__avatar dashboard-welcome__avatar--placeholder"
                        aria-hidden="true"
                    >
                        {firstName.charAt(0).toUpperCase()}
                    </div>
                )}

                <div className="dashboard-welcome__details">
                    <span className="dashboard-welcome__label">
                        YOUR AUTHOR PROFILE
                    </span>

                    <h2>{user?.name || "Your profile"}</h2>

                    <p>
                        {user?.bio ||
                            "Add a short bio to introduce yourself to readers."}
                    </p>

                    <span className="dashboard-welcome__username">
                        @{user?.username}
                    </span>
                </div>

                <Link
                    to={`/profile/${user?.username || user?.id}`}
                    className="dashboard-welcome__public-link"
                >
                    View public profile ↗
                </Link>
            </section>

            <section className="dashboard-articles">
                <div className="dashboard-articles__heading">
                    <div>
                        <h2>Your articles</h2>
                        <p>Manage your published work and drafts.</p>
                    </div>

                    <div
                        className="dashboard-filters"
                        aria-label="Filter articles"
                    >
                        {["all", "published", "draft"].map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                className={
                                    activeFilter === filter ? "is-active" : ""
                                }
                                aria-pressed={activeFilter === filter}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter === "all"
                                    ? "All"
                                    : filter === "published"
                                        ? "Published"
                                        : "Drafts"}
                            </button>
                        ))}
                    </div>
                </div>

                {feedback && (
                    <p className="dashboard-feedback" role="status">
                        {feedback}
                    </p>
                )}

                {isLoading ? (
                    <p role="status">Loading your articles...</p>
                ) : hasPostLoadError ? (
                    <p role="alert">{error}</p>
                ) : (
                    <>
                        {error && (
                            <p className="dashboard-feedback" role="alert">
                                {error}
                            </p>
                        )}

                        {filteredPosts.length > 0 ? (
                            <div className="dashboard-list">
                                {filteredPosts.map((post) => (
                                    <article
                                        key={post.id}
                                        className="dashboard-post"
                                    >
                                        {post.thumbnail && (
                                            <img
                                                src={post.thumbnail}
                                                alt=""
                                                className="dashboard-post__image"
                                            />
                                        )}

                                        <div className="dashboard-post__details">
                                            <span
                                                className={`dashboard-post__status dashboard-post__status--${post.status}`}
                                            >
                                                {post.status}
                                            </span>

                                            <h3>
                                                {post.title || "Untitled draft"}
                                            </h3>

                                            <p>
                                                {post.description ||
                                                    post.excerpt ||
                                                    "Continue writing your article."}
                                            </p>

                                            <span className="dashboard-post__date">
                                                {formatDate(
                                                    post.publishedAt ||
                                                    post.updatedAt ||
                                                    post.createdAt
                                                )}
                                            </span>
                                        </div>

                                        <div className="dashboard-post__actions">
                                            <Link to={`/editor/${post.id}`}>
                                                Edit
                                            </Link>

                                            {post.status === "published" && (
                                                <Link to={`/post/${post.slug}`}>
                                                    View
                                                </Link>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDeleteTarget(post);
                                                    setFeedback("");
                                                    setError("");
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="dashboard-empty">
                                <h3>
                                    {activeFilter === "draft"
                                        ? "No drafts yet"
                                        : activeFilter === "published"
                                            ? "No published articles"
                                            : "Your workspace is empty"}
                                </h3>

                                <p>
                                    Your articles will appear here as you
                                    create and manage them.
                                </p>

                                <Link to="/editor/new">
                                    Write your first article
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </section>

            {deleteTarget && (
                <div className="dashboard-modal" role="presentation">
                    <section
                        className="dashboard-modal__content"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-dialog-title"
                    >
                        <h2 id="delete-dialog-title">
                            Delete this article?
                        </h2>

                        <p>
                            This will permanently delete "
                            {deleteTarget.title || "Untitled draft"}".
                        </p>

                        <div className="dashboard-modal__actions">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting
                                    ? "Deleting..."
                                    : "Delete article"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
