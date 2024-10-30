import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows a fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log the error to the console
    console.error("Caught in ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      // Render nothing or a fallback UI, but don't disrupt the app.
      return null;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
