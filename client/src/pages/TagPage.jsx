
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PostCard from "../components/post/PostCard";
import { getPostsByTag } from "../api/tagsApi";
import { getErrorMessage } from "../api/axios";

function TagPage() {
    const { slug } = useParams();

    const [tag, setTag] = useState(null);
    const [posts, setPosts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [loadedSlug, setLoadedSlug] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let isCurrent = true;

        async function loadTagPage() {
            try {
                const result = await getPostsByTag(slug, {
                    page: 1,
                    limit: 9,
                });

                if (isCurrent) {
                    setTag(result.tag);
                    setPosts(result.posts);
                    setPagination(result.pagination);
                    setPage(1);
                    setError("");
                }
            } catch (loadError) {
                if (isCurrent) {
                    // Clear old topic data after a failed request.
                    setTag(null);
                    setPosts([]);
                    setPagination(null);
                    setPage(1);

                    setError(
                        getErrorMessage(
                            loadError,
                            "Could not load this topic."
                        )
                    );
                }
            } finally {
                if (isCurrent) {
                    setLoadedSlug(slug);
                }
            }
        }

        loadTagPage();

        return () => {
            isCurrent = false;
        };
    }, [slug]);

    async function loadMore() {
        if (!pagination?.hasNextPage || isLoadingMore) return;

        setIsLoadingMore(true);
        setError("");

        try {
            const nextPage = page + 1;

            const result = await getPostsByTag(slug, {
                page: nextPage,
                limit: 9,
            });

            setPosts((current) => [
                ...current,
                ...result.posts,
            ]);

            setPagination(result.pagination);
            setPage(nextPage);
        } catch (loadError) {
            setError(
                getErrorMessage(
                    loadError,
                    "Could not load more articles."
                )
            );
        } finally {
            setIsLoadingMore(false);
        }
    }

    const isLoading = loadedSlug !== slug;
    const currentPosts = isLoading ? [] : posts;
    const currentPagination = isLoading ? null : pagination;
    const visibleError = isLoading ? "" : error;

    const formattedTag =
        (!isLoading && tag?.name) ||
        (slug ? slug.replace(/-/g, " ") : "Topic");

    return (
        <div className="container tag-page">
            <header className="tag-page__header">
                <Link to="/" className="tag-page__back">
                    ← Back to home
                </Link>

                <p className="tag-page__eyebrow">
                    EXPLORE TOPICS
                </p>

                <h1>{formattedTag}</h1>

                <p>
                    Discover articles, tutorials, and insights about{" "}
                    {formattedTag}.
                </p>

                {!isLoading && !visibleError && (
                    <span className="tag-page__count">
                        {currentPagination?.total ?? currentPosts.length}{" "}
                        {(currentPagination?.total ?? currentPosts.length) === 1
                            ? "article"
                            : "articles"}
                    </span>
                )}
            </header>

            <section
                className="tag-page__posts"
                aria-label={`${formattedTag} articles`}
            >
                {isLoading ? (
                    <p role="status">
                        Loading articles...
                    </p>
                ) : visibleError && currentPosts.length === 0 ? (
                    <p role="alert">
                        {visibleError}
                    </p>
                ) : currentPosts.length > 0 ? (
                    <>
                        {visibleError && (
                            <p role="alert">
                                {visibleError}
                            </p>
                        )}

                        {currentPosts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                            />
                        ))}

                        {currentPagination?.hasNextPage && (
                            <button
                                type="button"
                                onClick={loadMore}
                                disabled={isLoadingMore}
                            >
                                {isLoadingMore
                                    ? "Loading..."
                                    : "Load more articles"}
                            </button>
                        )}
                    </>
                ) : (
                    <div className="tag-page__empty">
                        <h2>No articles yet</h2>

                        <p>
                            There are currently no articles published
                            under this topic.
                        </p>

                        <Link to="/">
                            Explore all posts
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
}

export default TagPage;
