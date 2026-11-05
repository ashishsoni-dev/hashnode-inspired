import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";

function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const { user, status, signOut } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    function closeMenu() {
        setMenuOpen(false);
    }

    function handleLogout() {
        signOut();
        closeMenu();
        navigate("/");
    }

    return (
        <header className="navbar">
            <nav className="navbar__inner container" aria-label="Main navigation">
                <Link to="/" className="navbar__brand" onClick={closeMenu} aria-label="Hashnode home">
                    <span className="navbar__brand-mark" aria-hidden="true">h</span>
                    <span className="navbar__brand-name">
                        hashnode<span className="navbar__brand-dot">.</span>
                    </span>
                </Link>

                <button
                    type="button"
                    className={`navbar__menu-toggle ${menuOpen ? "is-active" : ""}`}
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    aria-controls="navbar-menu"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <span /><span /><span />
                </button>

                <div id="navbar-menu" className={`navbar__actions ${menuOpen ? "is-open" : ""}`}>
                    <button
                        type="button"
                        onClick={() => { toggleTheme(); closeMenu(); }}
                        className="theme-button"
                        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                    >
                        <span className="theme-button__icon" aria-hidden="true">
                            {theme === "light" ? "☾" : "☀"}
                        </span>
                        <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
                    </button>

                    <NavLink to="/feed" className="navbar__link" onClick={closeMenu}>Feed</NavLink>
                    <NavLink to="/tags" className="navbar__link" onClick={closeMenu}>Explore topics</NavLink>

                    {status === "loading" ? (
                        <span className="navbar__link" aria-live="polite">Checking session...</span>
                    ) : status === "authenticated" ? (
                        <>
                            <NavLink to="/dashboard" className="navbar__link" onClick={closeMenu}>Dashboard</NavLink>
                            <NavLink to="/bookmarks" className="navbar__link" onClick={closeMenu}>Bookmarks</NavLink>
                            <NavLink to={`/profile/${user.username || user.id}`} className="navbar__link" onClick={closeMenu}>Profile</NavLink>
                            <button type="button" className="navbar__link" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className="navbar__link" onClick={closeMenu}>Log in</NavLink>
                            <NavLink to="/register" className="navbar__register" onClick={closeMenu}>
                                Get started <span aria-hidden="true"> ↗</span>
                            </NavLink>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Navbar;
