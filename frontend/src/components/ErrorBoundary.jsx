import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    // Keep console output for debugging in dev builds.
    // eslint-disable-next-line no-console
    console.error('UI crashed:', error);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="glass p-6 rounded-3xl border border-white/5">
          <div className="text-2xl font-black">Something went wrong</div>
          <div className="text-white/50 mt-2 text-sm">
            The page crashed while rendering. Check the browser console for the full error.
          </div>
          <div className="mt-4 text-sm font-mono text-danger break-words">
            {String(this.state.error?.message || this.state.error)}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
            <Link to="/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;

