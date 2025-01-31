// API yapılandırması
export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    TIMEOUT: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
}; 