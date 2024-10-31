const isProduction = process.env.NODE_ENV === 'production';

export const logError = (message, error) => {
    if (!isProduction) {
        console.error(message, error); // Log to console in development
    }

};