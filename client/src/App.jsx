import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import PageLayout from "./components/layout/PageLayout";
import PostFeed from "./components/post/PostFeed";
import PostCard from "./components/post/PostCard";
import { getPosts, getFeaturedPosts } from "./api/postsApi";
import { getTags } from "./api/tagsApi";
import { getErrorMessage } from "./api/axios";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";

const AuthForm = lazy(() => import("./components/common/AuthForm"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const TagPage = lazy(() => import("./pages/TagPage"));
const TagsPage = lazy(() => import("./pages/TagsPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PostEditor = lazy(() => import("./pages/PostEditor"));
const EditorPreview = lazy(() => import("./pages/EditorPreview"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const FeedPage = lazy(() => import("./pages/FeedPage"));
const BookmarksPage = lazy(() => import("./pages/BookmarksPage"));




const PostPage = lazy(() => import("./pages/PostPage"));




const HOMEPAGE_POST_LIMIT = 9;

function Home() {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState("");
  const [featuredRetryCount, setFeaturedRetryCount] = useState(0);

  const [latestPosts, setLatestPosts] = useState([]);
  const [latestPostCount, setLatestPostCount] = useState(0);
  const [latestLoading, setLatestLoading] = useState(true);
  const [latestLoadError, setLatestLoadError] = useState("");
  const [latestRetryCount, setLatestRetryCount] = useState(0);
  const [latestSearchTerm, setLatestSearchTerm] = useState("");
  const [isSearchingLatest, setIsSearchingLatest] = useState(false);
  const [latestSearchError, setLatestSearchError] = useState("");

  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState("");
  const [topicsRetryCount, setTopicsRetryCount] = useState(0);

  // Load each homepage section separately so one failed request does not
  // prevent the other sections from displaying their data.
  useEffect(() => {
    let isCurrent = true;

    async function loadFeatured() {
      setFeaturedLoading(true);
      setFeaturedError("");

      try {
        const featured = await getFeaturedPosts();
        if (isCurrent) setFeaturedPosts(featured);
      } catch (error) {
        if (isCurrent) {
          setFeaturedError(
            getErrorMessage(error, "Could not load featured articles right now.")
          );
        }
      } finally {
        if (isCurrent) setFeaturedLoading(false);
      }
    }

    loadFeatured();
    return () => {
      isCurrent = false;
    };
  }, [featuredRetryCount]);

  useEffect(() => {
    let isCurrent = true;

    async function loadLatest() {
      setLatestLoading(true);
      setLatestLoadError("");

      try {
        const result = await getPosts({
          page: 1,
          limit: HOMEPAGE_POST_LIMIT,
          sort: "newest",
        });

        if (isCurrent) {
          setLatestPosts(result.posts);
          setLatestPostCount(result.pagination?.total ?? result.posts.length);
        }
      } catch (error) {
        if (isCurrent) {
          setLatestLoadError(
            getErrorMessage(error, "Could not load the latest articles right now.")
          );
        }
      } finally {
        if (isCurrent) setLatestLoading(false);
      }
    }

    loadLatest();
    return () => {
      isCurrent = false;
    };
  }, [latestRetryCount]);

  useEffect(() => {
    let isCurrent = true;

    async function loadTopics() {
      setTopicsLoading(true);
      setTopicsError("");

      try {
        const availableTags = await getTags();
        if (isCurrent) setTopics(availableTags);
      } catch (error) {
        if (isCurrent) {
          setTopicsError(
            getErrorMessage(error, "Could not load topics right now.")
          );
        }
      } finally {
        if (isCurrent) setTopicsLoading(false);
      }
    }

    loadTopics();
    return () => {
      isCurrent = false;
    };
  }, [topicsRetryCount]);

  // Keep track of the latest search request so older responses cannot replace newer results.
  const latestSearchRequest = useRef(0);

  // Search all published article titles, but display only nine cards in this section.
  const searchLatestPosts = useCallback(async (searchTerm) => {
    const requestNumber = latestSearchRequest.current + 1;
    latestSearchRequest.current = requestNumber;

    setIsSearchingLatest(true);
    setLatestSearchError("");

    try {
      const result = await getPosts({
        page: 1,
        limit: HOMEPAGE_POST_LIMIT,
        search: searchTerm || undefined,
        sort: "newest",
      });

      if (requestNumber !== latestSearchRequest.current) return;

      setLatestPosts(result.posts);
      setLatestPostCount(result.pagination?.total ?? result.posts.length);
      setLatestSearchTerm(searchTerm);
    } catch (error) {
      if (requestNumber !== latestSearchRequest.current) return;

      setLatestSearchError(
        getErrorMessage(error, "Could not search articles right now.")
      );
    } finally {
      if (requestNumber === latestSearchRequest.current) {
        setIsSearchingLatest(false);
      }
    }
  }, []);

  return (
    <div className="container home-page">
      <section className="home-hero">
        <div className="home-hero__glow" aria-hidden="true" />

        <div className="home-hero__content">
          <span className="home-hero__eyebrow">
            <span className="home-hero__eyebrow-dot" aria-hidden="true" />
            THE DEVELOPER COMMUNITY
          </span>

          <h1>
            Where developers <span>learn, build,</span> and grow.
          </h1>

          <p>
            Discover ideas, explore new technologies, and learn from
            developers building the future of software.
          </p>

          <div className="home-hero__actions">
            <a href="#latest-articles" className="home-hero__cta">
              Explore articles <span aria-hidden="true">↗</span>
            </a>

            <span className="home-hero__note">
              Built for curious developers.
            </span>
          </div>
        </div>

        <div className="home-hero__visual" aria-label="Code editor preview">
          <div className="hero-code-window">
            <div className="hero-code-window__topbar">
              <div className="hero-code-window__dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>

              <span className="hero-code-window__filename">
                developer.js
              </span>

              <span className="hero-code-window__status">JS</span>
            </div>

            <div className="hero-code-window__body" aria-hidden="true">
              <div><span className="code-line-number">01</span><span className="code-purple">const</span> developer = {"{"}</div>
              <div><span className="code-line-number">02</span>  name: <span className="code-green">"You"</span>,</div>
              <div><span className="code-line-number">03</span>  mindset: <span className="code-green">"Always learning"</span>,</div>
              <div><span className="code-line-number">04</span>  skills: [</div>
              <div><span className="code-line-number">05</span>    <span className="code-cyan">"Build"</span>, <span className="code-cyan">"Create"</span>,</div>
              <div><span className="code-line-number">06</span>    <span className="code-cyan">"Repeat"</span></div>
              <div><span className="code-line-number">07</span>  ]</div>
              <div><span className="code-line-number">08</span>{"};"}</div>
              <div className="hero-code-window__cursor-line">
                <span className="code-line-number">09</span>
                <span className="hero-code-window__cursor" />
              </div>
            </div>

            <div className="hero-code-window__footer">
              <span><span className="hero-status-dot" /> Ready to build</span>
              <span>UTF-8 · JavaScript</span>
            </div>
          </div>

          <div className="hero-tech-badge hero-tech-badge--react">
            <span aria-hidden="true">⚛</span> React
          </div>

          <div className="hero-tech-badge hero-tech-badge--js">
            <span aria-hidden="true">JS</span> JavaScript
          </div>

          <div className="hero-tech-badge hero-tech-badge--dev">
            <span aria-hidden="true">{"</>"}</span> Keep building
          </div>
        </div>

        <div className="home-hero__decoration" aria-hidden="true">
          <div className="home-hero__decoration-orb" />
          <div className="home-hero__decoration-ring" />
        </div>
      </section>

      <section className="home-featured" aria-label="Featured articles" aria-busy={featuredLoading}>
        <div className="home-featured__heading">
          <div>
            <span className="home-featured__eyebrow">EDITOR'S PICKS</span>
            <h2>Featured articles</h2>
          </div>
          <span>Worth your time ✦</span>
        </div>

        <div className="home-featured__grid">
          {featuredLoading ? (
            <p className="home-section__feedback" role="status">Loading featured articles...</p>
          ) : featuredError ? (
            <div className="home-section__feedback home-section__feedback--error" role="alert">
              <p>{featuredError}</p>
              <button
                className="home-section__retry"
                type="button"
                onClick={() => setFeaturedRetryCount((count) => count + 1)}
              >
                Try again
              </button>
            </div>
          ) : featuredPosts.length > 0 ? (
            featuredPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <p className="home-section__feedback" role="status">
              No featured articles are available yet.
            </p>
          )}
        </div>
      </section>

      <section className="home-topics" aria-label="Browse topics" aria-busy={topicsLoading}>
        <div className="home-topics__heading">
          <div>
            <span className="home-topics__eyebrow">YOUR NEXT DEEP DIVE</span>
            <h2>Explore topics</h2>
          </div>

          <Link to="/tags" className="home-topics__hint">
            Browse all topics →
          </Link>
        </div>

        <div className="home-topics__list">
          {topicsLoading ? (
            <p className="home-section__feedback" role="status">Loading topics...</p>
          ) : topicsError ? (
            <div className="home-section__feedback home-section__feedback--error" role="alert">
              <p>{topicsError}</p>
              <button
                className="home-section__retry"
                type="button"
                onClick={() => setTopicsRetryCount((count) => count + 1)}
              >
                Try again
              </button>
            </div>
          ) : topics.length > 0 ? (
            topics.slice(0, 6).map((topic, index) => (
              <Link
                key={topic.slug}
                to={`/tag/${topic.slug}`}
                className="home-topics__link"
                style={{ "--topic-index": index }}
              >
                {topic.name}
                <span className="home-topics__arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            ))
          ) : (
            <p className="home-section__feedback" role="status">
              No topics are available yet.
            </p>
          )}
        </div>
      </section>

      <div id="latest-articles">
        {latestLoading ? (
          <p className="home-section__feedback" role="status">Loading latest articles...</p>
        ) : latestLoadError ? (
          <div className="home-section__feedback home-section__feedback--error" role="alert">
            <p>{latestLoadError}</p>
            <button
              className="home-section__retry"
              type="button"
              onClick={() => setLatestRetryCount((count) => count + 1)}
            >
              Try again
            </button>
          </div>
        ) : (
          <PostFeed
            posts={latestPosts}
            totalPosts={latestPostCount}
            searchTerm={latestSearchTerm}
            isSearching={isSearchingLatest}
            searchError={latestSearchError}
            onSearch={searchLatestPosts}
          />
        )}
      </div>
    </div>
  );
}


function Login() {
  return (
    <div className="auth-page container">
      <AuthForm mode="login" />
    </div>
  );
}

function Register() {
  return (
    <div className="auth-page container">
      <AuthForm mode="register" />
    </div>
  );
}



function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

function PostPageRoute() {
  const { pathname } = useLocation();

  return <PostPage key={pathname} />;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <PageLayout>
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="container" role="status" aria-live="polite">
                  Loading page...
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route path="/feed" element={<FeedPage />} />

                <Route path="/tag/:slug" element={<TagPage />} />

                <Route path="/post/:slug" element={<PostPageRoute />} />

                <Route path="/tags" element={<TagsPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/editor/new" element={<PostEditor />} />
                  <Route path="/editor/:id" element={<PostEditor />} />
                  <Route path="/editor/preview" element={<EditorPreview />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/bookmarks" element={<BookmarksPage />} />
                </Route>

                <Route path="/profile/:id" element={<ProfilePage />} />


                <Route path="*" element={<NotFoundPage />} />


              </Routes>



            </Suspense>
          </ErrorBoundary>
        </PageLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;