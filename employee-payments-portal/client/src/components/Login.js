import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Make sure to import the CSS file

const Login = ({ setToken, navigateToPayments }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://localhost:5000/api/users/login',
                { username, password },
                { headers: { 'Content-Type': 'application/json' } }
            );
    
            console.log('Response data:', response.data); // Success response data
            setToken(response.data.token); // Save the token in state
            localStorage.setItem('token', response.data.token); // Store token in localStorage
            navigateToPayments(); // Redirect on success
        } catch (error) {
            if (error.response) {
                console.error('Error Status:', error.response.status); 
                console.error('Error Data:', error.response.data);
                setMessage(error.response.data.message);
            } else if (error.request) {
                console.error('No response received:', error.request);
                setMessage('No response from server. Please check your connection.');
            } else {
                console.error('Error:', error.message);
            }
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Login</h2>
            <form className="login-form" onSubmit={handleLogin}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    className="login-input"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="login-input"
                />
                <button type="submit" className="login-button">Login</button>
                {message && <p className="login-message">{message}</p>}
            </form>
        </div>
    );
};

export default Login;
