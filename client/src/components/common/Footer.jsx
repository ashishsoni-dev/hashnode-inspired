import { Link } from "react-router-dom";

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="site-footer__inner">
                <Link to="/" className="site-footer__brand">
                    hashnode.
                </Link>

                <p className="site-footer__description">
                    A place to share ideas, knowledge, and stories.
                </p>

                <nav
                    className="site-footer__links"
                    aria-label="Footer navigation"
                >
                    <Link to="/">Home</Link>
                    <Link to="/feed">Feed</Link>
                    <Link to="/tags">Explore topics</Link>
                    <Link to="/login">Log in</Link>
                    <Link to="/register">Get started</Link>
                </nav>

                <p className="site-footer__copyright">
                    © {currentYear} Hashnode Clone. Built for learning.
                </p>
            </div>
        </footer>
    );
}

export default Footer;