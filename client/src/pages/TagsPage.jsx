
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTags } from "../api/tagsApi";
import { getErrorMessage } from "../api/axios";

function TagsPage() {
    const [tags, setTags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isCurrent = true;

        async function loadTags() {
            try {
                const availableTags = await getTags();

                if (isCurrent) {
                    setTags(availableTags);
                    setError("");
                }
            } catch (loadError) {
                if (isCurrent) {
                    setError(
                        getErrorMessage(
                            loadError,
                            "Could not load topics."
                        )
                    );
                }
            } finally {
                if (isCurrent) {
                    setIsLoading(false);
                }
            }
        }

        loadTags();

        return () => {
            isCurrent = false;
        };
    }, []);

    return (
        <div className="container tags-page">
            <header className="tags-page__header">
                <Link to="/" className="tags-page__back">
                    ← Back to home
                </Link>

                <p className="tags-page__eyebrow">
                    EXPLORE THE DEVELOPER COMMUNITY
                </p>

                <h1>Discover your next topic.</h1>

                <p>
                    Explore technologies, discover tutorials, and learn
                    from developers across the community.
                </p>

                {!isLoading && !error && (
                    <span className="tags-page__count">
                        {tags.length}{" "}
                        {tags.length === 1 ? "topic" : "topics"}
                    </span>
                )}
            </header>

            {isLoading ? (
                <p role="status">Loading topics...</p>
            ) : error ? (
                <p role="alert">{error}</p>
            ) : tags.length > 0 ? (
                <section
                    className="tags-page__grid"
                    aria-label="Available topics"
                >
                    {tags.map((tag) => (
                        <Link
                            key={tag.slug}
                            to={`/tag/${tag.slug}`}
                            className="tags-page__card"
                        >
                            <span
                                className="tags-page__symbol"
                                aria-hidden="true"
                            >
                                #
                            </span>

                            <h2>{tag.name}</h2>

                            <p>
                                {tag.count}{" "}
                                {tag.count === 1 ? "article" : "articles"}
                            </p>

                            <span className="tags-page__explore">
                                Explore topic ↗
                            </span>
                        </Link>
                    ))}
                </section>
            ) : (
                <div className="tags-page__empty">
                    <h2>No topics available yet</h2>

                    <p>
                        Topics will appear here when articles are published.
                    </p>

                    <Link to="/">Explore articles</Link>
                </div>
            )}
        </div>
    );
}

export default TagsPage;
