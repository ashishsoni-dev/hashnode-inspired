import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function ProtectedRoute() {
    const { status, sessionError, retrySession } = useAuth();
    const location = useLocation();

    if (status === "loading") {
        return (
            <div className="container" role="status" aria-live="polite">
                Checking your session...
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="container" role="alert">
                <h2>Unable to verify your session</h2>

                <p>{sessionError}</p>

                <button
                    type="button"
                    onClick={retrySession}
                    className="auth-form__submit"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (status !== "authenticated") {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}

export default ProtectedRoute;