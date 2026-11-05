
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PostCard from "../components/post/PostCard";
import { getMyBookmarks } from "../api/usersApi";
import { getErrorMessage } from "../api/axios";

function BookmarksPage() {
    const [posts, setPosts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let isCurrent = true;

        async function loadBookmarks() {
            try {
                const result = await getMyBookmarks({
                    page: 1,
                    limit: 9,
                });

                if (isCurrent) {
                    setPosts(result.posts);
                    setPagination(result.pagination);
                    setPage(1);
                    setError("");
                }
            } catch (loadError) {
                if (isCurrent) {
                    setError(
                        getErrorMessage(
                            loadError,
                            "Could not load your saved articles."
                        )
                    );
                }
            } finally {
                if (isCurrent) {
                    setIsLoading(false);
                }
            }
        }

        loadBookmarks();

        return () => {
            isCurrent = false;
        };
    }, []);

    async function loadMore() {
        if (!pagination?.hasNextPage || isLoadingMore) return;

        setIsLoadingMore(true);
        setError("");

        try {
            const nextPage = page + 1;

            const result = await getMyBookmarks({
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
                    "Could not load more saved articles."
                )
            );
        } finally {
            setIsLoadingMore(false);
        }
    }

    return (
        <div className="container profile-articles">
            <header className="profile-articles__heading">
                <div>
                    <p className="dashboard-page__eyebrow">
                        YOUR READING LIST
                    </p>

                    <h1>Saved articles</h1>

                    <p>Articles you bookmarked for later.</p>
                </div>

                <Link to="/feed">Explore articles</Link>
            </header>

            {isLoading ? (
                <p role="status">Loading saved articles...</p>
            ) : error && posts.length === 0 ? (
                <p role="alert">{error}</p>
            ) : posts.length > 0 ? (
                <>
                    {error && (
                        <p role="alert">{error}</p>
                    )}

                    <div className="profile-articles__grid">
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onBookmarkChange={(isBookmarked) => {
                                    if (!isBookmarked) {
                                        setPosts((current) =>
                                            current.filter(
                                                (item) => item.id !== post.id
                                            )
                                        );
                                    }
                                }}
                            />
                        ))}
                    </div>

                    {pagination?.hasNextPage && (
                        <button
                            type="button"
                            onClick={loadMore}
                            disabled={isLoadingMore}
                        >
                            {isLoadingMore
                                ? "Loading..."
                                : "Load more saved articles"}
                        </button>
                    )}
                </>
            ) : (
                <div className="profile-articles__empty">
                    <h2>No saved articles yet</h2>

                    <p>
                        Use the bookmark control on an article to save it here.
                    </p>

                    <Link to="/feed">Browse the feed</Link>
                </div>
            )}
        </div>
    );
}

export default BookmarksPage;
