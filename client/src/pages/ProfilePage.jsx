import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PostCard from "../components/post/PostCard";
import { getPublicProfile, followUser, unfollowUser } from "../api/usersApi";
import { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";

function ProfilePage() {
    const { id } = useParams();
    const { user: currentUser, isAuthenticated } = useAuth();
    const [author, setAuthor] = useState(null);
    const [posts, setPosts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [loadedProfileKey, setLoadedProfileKey] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [error, setError] = useState("");
    const profileKey = `${id}:${isAuthenticated}`;
    const isLoading = loadedProfileKey !== profileKey;

    useEffect(() => {
        let isCurrent = true;

        async function loadProfile() {
            try {
                const result = await getPublicProfile(id, { page: 1, limit: 9 });
                if (isCurrent) {
                    setAuthor(result.user);
                    setPosts(result.posts);
                    setPagination(result.pagination);
                    setPage(1);
                    setIsFollowing(result.user.isFollowing);
                    setError("");
                }
            } catch (loadError) {
                if (isCurrent) {
                    setAuthor(null);
                    setPosts([]);
                    setPagination(null);
                    setError(getErrorMessage(loadError, "Could not load this profile."));
                }
            } finally {
                if (isCurrent) setLoadedProfileKey(profileKey);
            }
        }

        loadProfile();
        return () => { isCurrent = false; };
    }, [id, isAuthenticated, profileKey]);

    async function loadMore() {
        if (!pagination?.hasNextPage || isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const nextPage = page + 1;
            const result = await getPublicProfile(id, { page: nextPage, limit: 9 });
            setPosts((current) => [...current, ...result.posts]);
            setPagination(result.pagination);
            setPage(nextPage);
        } catch (loadError) {
            setError(getErrorMessage(loadError, "Could not load more articles."));
        } finally {
            setIsLoadingMore(false);
        }
    }

    async function handleFollow() {
        if (!isAuthenticated || !author) return;
        setError("");

        try {
            const response = await (isFollowing
                ? unfollowUser(author.username)
                : followUser(author.username));
            setIsFollowing(response.following);
            setAuthor((current) => ({ ...current, followers: response.followers }));
        } catch (followError) {
            setError(getErrorMessage(followError, "Could not update your follow status."));
        }
    }

    const isOwnProfile = currentUser && author && currentUser.id === author.id;

    if (isLoading) {
        return <div className="container profile-page"><p role="status">Loading profile...</p></div>;
    }

    if (!author) {
        return (
            <div className="container profile-page">
                <Link to="/">← Back to home</Link>
                <section className="profile-page__empty"><h1>Author not found</h1><p>{error || "This author does not exist or their profile is unavailable."}</p></section>
            </div>
        );
    }

    return (
        <div className="container profile-page">
            <Link to="/" className="profile-page__back">← Back to home</Link>
            {error && <p role="alert">{error}</p>}

            <header className="profile-header">
                {author.avatarUrl ? (
                    <img className="profile-header__avatar" src={author.avatarUrl} alt={author.name} />
                ) : (
                    <div className="profile-header__avatar" aria-hidden="true">{author.name?.charAt(0)?.toUpperCase()}</div>
                )}

                <div className="profile-header__details">
                    <p className="profile-header__eyebrow">DEVELOPER PROFILE</p>
                    <h1>{author.name}</h1>
                    <p className="profile-header__username">@{author.username}</p>
                    <p className="profile-header__bio">{author.bio || "This author has not added a bio yet."}</p>
                    <p className="profile-header__followers">
                        <strong>{author.followers ?? 0}</strong> followers · <strong>{author.following ?? 0}</strong> following
                    </p>
                    {!isOwnProfile && isAuthenticated && (
                        <button type="button" onClick={handleFollow}>
                            {isFollowing ? "Following" : "Follow"}
                        </button>
                    )}
                    {!isOwnProfile && !isAuthenticated && <Link to="/login">Log in to follow</Link>}
                </div>
            </header>

            <section className="profile-articles">
                <div className="profile-articles__heading">
                    <div><h2>Published articles</h2><p>Articles written and shared by {author.name}.</p></div>
                    <span className="profile-articles__count">{pagination?.total ?? posts.length} {(pagination?.total ?? posts.length) === 1 ? "article" : "articles"}</span>
                </div>

                {posts.length > 0 ? (
                    <>
                        <div className="profile-articles__grid">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
                        {pagination?.hasNextPage && <button type="button" onClick={loadMore} disabled={isLoadingMore}>{isLoadingMore ? "Loading..." : "Load more articles"}</button>}
                    </>
                ) : (
                    <div className="profile-articles__empty"><h3>No published articles yet</h3><p>Published articles from this author will appear here.</p></div>
                )}
            </section>
        </div>
    );
}

export default ProfilePage;
