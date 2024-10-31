import React from 'react';
import { logError } from './logger'; // Import your logging function

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state to indicate an error has occurred
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to the console
        logError('An error occurred in a component:', error, errorInfo);
    }

    render() {
        return this.props.children; // Render children if there's no error
    }
}

export default ErrorBoundary;
