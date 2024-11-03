import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode as a named import
import Login from './components/Login';
import PaymentForm from './components/PaymentForm';

const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    // Helper function to check if the token is expired
    const isTokenExpired = (token) => {
        if (!token) return true;
        try {
            const { exp } = jwtDecode(token); // Use jwtDecode instead of jwt_decode
            return exp < Date.now() / 1000; // Check if the token's expiration is in the past
        } catch {
            return true; // If decoding fails, treat token as expired
        }
    };

    // Check token expiration on initial render
    useEffect(() => {
        if (isTokenExpired(token)) {
            setToken(null);
            localStorage.removeItem('token'); // Clear token from localStorage if expired
        }
    }, [token]);

    // Function to handle login and set token
    const handleLogin = (newToken) => {
        setToken(newToken);
        localStorage.setItem('token', newToken); // Save token in localStorage
    };

    // Render either the PaymentForm or Login component based on token presence and validity
    return (
        <div>
            {token ? (
                <PaymentForm token={token} />
            ) : (
                <Login setToken={handleLogin} />
            )}
        </div>
    );
};

export default App;
