import { Component } from "react";
import "./ErrorBoundary.css";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hasError: false,
        };
    }

    // Show the fallback screen when a child component crashes.
    static getDerivedStateFromError() {
        return {
            hasError: true,
        };
    }

    // Log the actual error for debugging.
    componentDidCatch(error, errorInfo) {
        console.error("Application rendering error:", error);
        console.error("Error details:", errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="app-error-boundary" role="alert">
                    <div className="app-error-boundary__content">
                        <h2>Something went wrong</h2>

                        <p>
                            We couldn't load this page.
                            Please try again.
                        </p>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                        >
                            Reload page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;