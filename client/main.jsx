import { Meteor } from 'meteor/meteor';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../imports/ui/App';
import './main.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Client render error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app-shell">
          <div className="card">
            <h2>App failed to render</h2>
            <p className="meta">A client-side error occurred. Open the browser console for details.</p>
            <pre className="error-box">{this.state.error.message || String(this.state.error)}</pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

Meteor.startup(() => {
  let container = document.getElementById('react-target');

  if (!container) {
    container = document.createElement('div');
    container.id = 'react-target';
    document.body.appendChild(container);
  }

  const root = createRoot(container);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
});
