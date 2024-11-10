import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode as a named import
import Login from './components/Login';
import Register from './components/Register';
import PaymentForm from './components/PaymentForm';
import EmployeeDashboard from './components/EmployeeDashboard'; // Import the EmployeeDashboard component

const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [role, setRole] = useState(null); // Store the user's role
    const [view, setView] = useState('login'); // State to toggle between login and register

    // Helper function to check if the token is expired
    const isTokenExpired = (token) => {
        if (!token) return true;
        try {
            const { exp } = jwtDecode(token);
            return exp < Date.now() / 1000; // Check if the token's expiration is in the past
        } catch {
            return true; // If decoding fails, treat token as expired
        }
    };

    // Check token expiration on initial render
    useEffect(() => {
        if (isTokenExpired(token)) {
            setToken(null);
            setRole(null);
            localStorage.removeItem('token');
        } else {
            // Decode the token to extract the role
            const decodedToken = jwtDecode(token);
            setRole(decodedToken.role); // Store the user's role
        }
    }, [token]);

    // Function to handle login and set token
    const handleLogin = (newToken) => {
        setToken(newToken);
        localStorage.setItem('token', newToken); // Save token in localStorage
    };

    // Function to handle registration and set token
    const handleRegister = (newToken) => {
        setToken(newToken);
        localStorage.setItem('token', newToken); // Save token in localStorage
    };

    // Function to navigate between Login and Register components
    const navigateToRegister = () => {
        setView('register');
    };

    const navigateToLogin = () => {
        setView('login');
    };

    // Render based on the role or login state
    return (
        <div>
            {token ? (
                // If the token exists, check the role
                role === 'employee' ? (
                    <EmployeeDashboard token={token} /> // Show Employee Dashboard for employees
                ) : (
                    <PaymentForm token={token} /> // Show PaymentForm for others (users)
                )
            ) : (
                <>
                    {view === 'login' ? (
                        <Login setToken={handleLogin} navigateToRegister={navigateToRegister} />
                    ) : (
                        <Register setToken={handleRegister} navigateToLogin={navigateToLogin} />
                    )}
                </>
            )}
        </div>
    );
};

export default App;
