import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ setToken, navigateToRegister, navigate }) => {
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
    
            console.log('Login response:', response); // Log the response data
            const user = response.data.user; // Assuming the user data is returned
            console.log('User role:', user.role); // Log user role
    
            // Save the token and user data
            setToken(response.data.token);
            localStorage.setItem('token', response.data.token);
    
            if (user.role === 'employee') {
                console.log('Redirecting to employee dashboard...');
                navigate('/employeedashboard');  // Ensure this is the correct path
            }else{
                navigate('/paymentform');
            }
        } catch (error) {
            console.error('Login error:', error); // Log any errors
            if (error.response) {
                setMessage(error.response.data.message);
            } else {
                setMessage('An error occurred');
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
            <p>
                Don't have an account?{' '}
                <button onClick={navigateToRegister}>Register</button>
            </p>
        </div>
    );
};

export default Login;
