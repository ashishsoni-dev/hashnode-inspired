import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";

function AuthForm({ mode }) {
    const isLogin = mode === "login";
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn, signUp, status } = useAuth();
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setFeedback("");
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        const name = String(formData.get("name") ?? "").trim();
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");

        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(name, email, password);
            }

            const destination = location.state?.from || "/dashboard";
            navigate(destination, { replace: true });
        } catch (error) {
            setFeedback(getErrorMessage(error, "Could not complete authentication."));
        } finally {
            setIsSubmitting(false);
        }
    }

    if (status === "loading") {
        return (
            <section className="auth-card">
                <p className="auth-card__description" role="status">Checking your session...</p>
            </section>
        );
    }

    if (status === "authenticated") {
        return <Navigate to={location.state?.from || "/dashboard"} replace />;
    }

    return (
        <section className="auth-card">
            <h1>{isLogin ? "Welcome back" : "Join the community"}</h1>

            <p className="auth-card__description">
                {isLogin
                    ? "Sign in to continue your developer journey."
                    : "Create an account to explore the developer community."}
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
                {!isLogin && (
                    <label>
                        Display name
                        <input
                            type="text"
                            name="name"
                            placeholder="Your name"
                            autoComplete="name"
                            maxLength={80}
                            required
                        />
                    </label>
                )}

                <label>
                    Email address
                    <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        maxLength={254}
                        required
                    />
                </label>

                <label>
                    Password
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        minLength={8}
                        maxLength={128}
                        required
                    />
                </label>

                <button type="submit" className="auth-form__submit" disabled={isSubmitting}>
                    {isSubmitting
                        ? "Please wait..."
                        : isLogin ? "Sign in" : "Create account"}
                </button>
            </form>

            {feedback && (
                <p className="auth-form__feedback auth-form__feedback--error" role="alert">
                    {feedback}
                </p>
            )}

            <div className="auth-card__footer">
                <p>
                    {isLogin ? "New to Hashnode?" : "Already have an account?"}{" "}
                    <Link to={isLogin ? "/register" : "/login"}>
                        {isLogin ? "Create an account" : "Sign in"}
                    </Link>
                </p>
            </div>
        </section>
    );
}

export default AuthForm;
