import { Link } from "react-router-dom";

function NotFoundPage() {
    return (
        <section className="not-found container">
            <p className="not-found__code">404</p>

            <h1>Page not found</h1>

            <p>
                Sorry, we couldn't find the page you're looking for.
                It may have been moved or doesn't exist.
            </p>

            <Link to="/" className="not-found__link">
                Back to homepage
            </Link>
        </section>
    );
}

export default NotFoundPage;