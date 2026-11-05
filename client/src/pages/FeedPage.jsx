import { useCallback, useEffect, useRef, useState } from "react";
import PostCard from "../components/post/PostCard";
import { useSearchParams } from "react-router-dom";
import { getPosts } from "../api/postsApi";
import { getTags } from "../api/tagsApi";
import { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import "../styles/feed.css";

const PAGE_SIZE = 9;

function FeedPage() {
    const { status } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialSearch = searchParams.get("search") || "";
    const [searchInput, setSearchInput] = useState(initialSearch);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [selectedTag, setSelectedTag] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");
    const [topics, setTopics] = useState([]);
    const [feedState, setFeedState] = useState({
        key: null,
        posts: [],
        page: 1,
        pagination: null,
        error: "",
    });
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadMoreRef = useRef(null);

    const feedKey = JSON.stringify([searchQuery, selectedTag, sortOrder, status]);
    const isLoading = feedState.key !== feedKey;
    const posts = isLoading ? [] : feedState.posts;
    const page = feedState.page;
    const pagination = isLoading ? null : feedState.pagination;
    const error = isLoading ? "" : feedState.error;

    useEffect(() => {
        const timer = window.setTimeout(() => setSearchQuery(searchInput.trim()), 350);
        return () => window.clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        let isCurrent = true;

        async function loadTopics() {
            try {
                const availableTags = await getTags();
                if (isCurrent) setTopics(availableTags);
            } catch {
                // The feed can still be browsed if the tag list is unavailable.
            }
        }

        loadTopics();
        return () => { isCurrent = false; };
    }, []);

    useEffect(() => {
        let isCurrent = true;

        async function loadFirstPage() {
            try {
                const result = await getPosts({
                    page: 1,
                    limit: PAGE_SIZE,
                    search: searchQuery || undefined,
                    tag: selectedTag === "all" ? undefined : selectedTag,
                    sort: sortOrder,
                });

                if (isCurrent) {
                    setFeedState({
                        key: feedKey,
                        posts: result.posts,
                        page: 1,
                        pagination: result.pagination,
                        error: "",
                    });
                }
            } catch (loadError) {
                if (isCurrent) {
                    setFeedState({
                        key: feedKey,
                        posts: [],
                        page: 1,
                        pagination: null,
                        error: getErrorMessage(loadError, "Could not load the feed."),
                    });
                }
            }
        }

        loadFirstPage();
        return () => { isCurrent = false; };
    }, [feedKey, searchQuery, selectedTag, sortOrder]);

    const loadMore = useCallback(async () => {
        if (isLoading || isLoadingMore || !pagination?.hasNextPage) return;

        setIsLoadingMore(true);

        try {
            const nextPage = page + 1;
            const result = await getPosts({
                page: nextPage,
                limit: PAGE_SIZE,
                search: searchQuery || undefined,
                tag: selectedTag === "all" ? undefined : selectedTag,
                sort: sortOrder,
            });

            setFeedState((current) => {
                if (current.key !== feedKey) return current;

                return {
                    ...current,
                    posts: [...current.posts, ...result.posts],
                    page: nextPage,
                    pagination: result.pagination,
                    error: "",
                };
            });
        } catch (loadError) {
            setFeedState((current) => current.key === feedKey
                ? { ...current, error: getErrorMessage(loadError, "Could not load more articles.") }
                : current);
        } finally {
            setIsLoadingMore(false);
        }
    }, [feedKey, isLoading, isLoadingMore, pagination, page, searchQuery, selectedTag, sortOrder]);

    useEffect(() => {
        const element = loadMoreRef.current;
        if (!element || !pagination?.hasNextPage || isLoadingMore || isLoading) return undefined;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) loadMore();
        }, { rootMargin: "300px" });

        observer.observe(element);
        return () => observer.disconnect();
    }, [loadMore, pagination, isLoadingMore, isLoading]);

    function clearFilters() {
        setSearchInput("");
        setSearchQuery("");
        setSelectedTag("all");
        setSortOrder("newest");
        setSearchParams({});
    }

    const hasActiveFilters = Boolean(searchInput.trim()) || selectedTag !== "all" || sortOrder !== "newest";

    return (
        <div className="container feed-page">
            <header className="feed-page__header">
                <p className="feed-page__eyebrow">THE DEVELOPER COMMUNITY</p>
                <h1>Explore ideas worth sharing.</h1>
                <p>Discover practical lessons, thoughtful perspectives, and useful ideas from developers.</p>
            </header>

            <section className="feed-page__controls" aria-label="Feed filters">
                <div className="feed-page__search">
                    <label htmlFor="feed-search">Search articles</label>
                    <input
                        id="feed-search"
                        type="search"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Search by article title..."
                    />
                </div>

                <div className="feed-page__filters">
                    <div className="feed-page__filter-control">
                        <label htmlFor="feed-topic">Topic</label>
                        <select id="feed-topic" value={selectedTag} onChange={(event) => setSelectedTag(event.target.value)}>
                            <option value="all">All topics</option>
                            {topics.map((topic) => (
                                <option key={topic.slug} value={topic.slug}>{topic.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="feed-page__filter-control">
                        <label htmlFor="feed-sort">Sort by</label>
                        <select id="feed-sort" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                        </select>
                    </div>
                </div>

                {hasActiveFilters && (
                    <button type="button" className="feed-page__clear-filters" onClick={clearFilters}>
                        Clear filters
                    </button>
                )}
            </section>

            <section className="feed-page__results" aria-labelledby="feed-results-heading">
                <div className="feed-page__results-heading">
                    <div>
                        <p className="feed-page__results-eyebrow">COMMUNITY STORIES</p>
                        <h2 id="feed-results-heading">Latest articles</h2>
                    </div>
                    {pagination && (
                        <p className="feed-page__result-count" role="status" aria-live="polite">
                            Showing {posts.length} of {pagination.total} articles
                        </p>
                    )}
                </div>

                {error && <p className="feed-page__error" role="alert">{error}</p>}

                {isLoading ? (
                    <p role="status">Loading articles...</p>
                ) : error && posts.length === 0 ? (
                    <p className="feed-page__error" role="alert">
                        {error}
                    </p>
                ) : posts.length > 0 ? (
                    <>
                        {error && (
                            <p className="feed-page__error" role="alert">
                                {error}
                            </p>
                        )}

                        <div className="post-feed__content feed-page__grid">
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>

                        {pagination?.hasNextPage ? (
                            <div className="feed-page__pagination" ref={loadMoreRef}>
                                <span className="feed-page__scroll-cue" aria-hidden="true">↓</span>

                                <p>
                                    {isLoadingMore
                                        ? "Loading more articles..."
                                        : "More articles load as you scroll"}
                                </p>

                                <button
                                    type="button"
                                    onClick={loadMore}
                                    disabled={isLoadingMore}
                                >
                                    {isLoadingMore ? "Loading..." : "Load more posts"}
                                </button>
                            </div>
                        ) : (
                            <p className="feed-page__end-message">
                                You’re all caught up. Thanks for exploring!
                            </p>
                        )}
                    </>
                ) : (
                    <div className="post-feed__empty feed-page__empty">
                        <h3>No matching articles</h3>
                        <p>Try another title or topic.</p>
                        <button type="button" onClick={clearFilters}>
                            Clear filters
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default FeedPage;
