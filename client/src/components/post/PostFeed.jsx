import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PostCard from "./PostCard";

const SEARCH_DELAY_MS = 350;

function PostFeed({
    posts = [],
    totalPosts = posts.length,
    searchTerm = "",
    isSearching = false,
    searchError = "",
    onSearch,
}) {
    const [searchInput, setSearchInput] = useState("");
    const isFirstRender = useRef(true);

    // Wait briefly after typing so i do not send a request for every keystroke.
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return undefined;
        }

        const searchTermToSend = searchInput.trim();

        // Do not sned another request when the search has not changed.
        if (searchTermToSend === searchTerm) {
            return undefined;
        }

        const searchTimer = window.setTimeout(() => {
            onSearch?.(searchTermToSend);
        }, SEARCH_DELAY_MS);

        return () => window.clearTimeout(searchTimer);
    }, [searchInput, searchTerm, onSearch]);

    function clearSearch() {
        setSearchInput("");
    }

    return (
        <section className="post-feed" aria-labelledby="latest-posts-heading">
            <div className="post-feed__toolbar">
                <header className="post-feed__header">
                    <h2 id="latest-posts-heading">Latest Posts</h2>
                    <p>Discover fresh stories from the developer community.</p>
                </header>

                <div className="post-feed__search" role="search">
                    <label className="visually-hidden" htmlFor="latest-posts-search">
                        Search published article titles
                    </label>
                    <input
                        id="latest-posts-search"
                        aria-label="Search published article titles"
                        type="search"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Search latest posts..."
                        maxLength={100}
                        autoComplete="off"
                    />
                    {searchInput && (
                        <button
                            className="post-feed__clear-search"
                            type="button"
                            onClick={clearSearch}
                            aria-label="Clear article search"
                        >
                            Clear
                        </button>
                    )}
                    {isSearching && <span className="post-feed__search-status">Searching...</span>}
                </div>
            </div>

            <div className="post-feed__status-row" aria-live="polite" aria-busy={isSearching}>
                {isSearching ? (
                    <p role="status">Searching the latest articles...</p>
                ) : searchTerm ? (
                    <p role="status">
                        {totalPosts === 0
                            ? `No articles found for “${searchTerm}”.`
                            : `Showing ${posts.length} of ${totalPosts} matching articles for “${searchTerm}”.`}
                    </p>
                ) : (
                    <p role="status">
                        {totalPosts > posts.length
                            ? `Showing ${posts.length} of ${totalPosts} latest articles.`
                            : `Showing ${posts.length} latest ${posts.length === 1 ? "article" : "articles"}.`}
                    </p>
                )}
            </div>

            {searchError && <p className="post-feed__error" role="alert">{searchError}</p>}

            {isSearching ? (
                <p className="post-feed__loading" role="status">Loading matching articles...</p>
            ) : posts.length > 0 ? (
                <div className="post-feed__content">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <div className="post-feed__empty">
                    <h3>{searchTerm ? "No matching articles" : "No articles published yet"}</h3>
                    <p>
                        {searchTerm
                            ? "Try another title or clear your search to see the latest posts."
                            : "Published articles from the community will appear here."}
                    </p>
                    {searchTerm && (
                        <button className="post-feed__empty-clear" type="button" onClick={clearSearch}>
                            Clear search
                        </button>
                    )}
                </div>
            )}

            <div className="post-feed__actions">
                <Link
                    to={searchTerm ? `/feed?search=${encodeURIComponent(searchTerm)}` : "/feed"}
                    className="post-feed__view-all"
                >
                    {searchTerm ? "View all matching posts" : "View all posts"}
                    <span aria-hidden="true">→</span>
                </Link>
            </div>
        </section>
    );
}

export default PostFeed;
