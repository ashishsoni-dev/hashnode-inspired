import { useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import { getCurrentUser, loginUser, registerUser } from "../api/authApi";
import { TOKEN_KEY } from "../api/axios";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

    const [status, setStatus] = useState(() =>
        localStorage.getItem(TOKEN_KEY) ? "loading" : "guest"
    );

    const [sessionError, setSessionError] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let isCurrent = true;

        async function restoreSession() {
            const savedToken = localStorage.getItem(TOKEN_KEY);

            if (!savedToken) {
                setUser(null);
                setToken(null);
                setSessionError("");
                setStatus("guest");
                return;
            }

            try {
                const currentUser = await getCurrentUser();

                if (isCurrent) {
                    setUser(currentUser);
                    setToken(savedToken);
                    setSessionError("");
                    setStatus("authenticated");
                }
            } catch (error) {
                if (!isCurrent) return;

                // A 401 means the saved authentication is invalid.
                if (error.response?.status === 401) {
                    localStorage.removeItem(TOKEN_KEY);
                    setUser(null);
                    setToken(null);
                    setSessionError("");
                    setStatus("guest");
                    return;
                }

                // Network and server errors should not delete the token.
                setUser(null);
                setToken(savedToken);

                setSessionError(
                    "We couldn't verify your session. Check your connection and try again."
                );

                setStatus("error");
            }
        }

        restoreSession();

        return () => {
            isCurrent = false;
        };
    }, [retryCount]);

    useEffect(() => {
        function handleExpiredSession() {
            localStorage.removeItem(TOKEN_KEY);
            setUser(null);
            setToken(null);
            setSessionError("");
            setStatus("guest");
        }

        window.addEventListener("hashnode:session-expired", handleExpiredSession);

        return () => {
            window.removeEventListener("hashnode:session-expired", handleExpiredSession);
        };
    }, []);

    function retrySession() {
        setSessionError("");
        setStatus("loading");
        setRetryCount((count) => count + 1);
    }

    async function signIn(email, password) {
        const result = await loginUser({ email, password });

        localStorage.setItem(TOKEN_KEY, result.token);
        setToken(result.token);
        setUser(result.user);
        setSessionError("");
        setStatus("authenticated");

        return result.user;
    }

    async function signUp(name, email, password) {
        const result = await registerUser({ name, email, password });

        localStorage.setItem(TOKEN_KEY, result.token);
        setToken(result.token);
        setUser(result.user);
        setSessionError("");
        setStatus("authenticated");

        return result.user;
    }

    function signOut() {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken(null);
        setSessionError("");
        setStatus("guest");
    }

    function updateUser(updatedUser) {
        setUser(updatedUser);
    }

    const value = {
        user,
        token,
        status,
        sessionError,
        isAuthenticated: status === "authenticated",
        signIn,
        signUp,
        signOut,
        updateUser,
        retrySession,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}