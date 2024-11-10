import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

const Register = ({ setToken, navigateToPayments }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://localhost:5000/api/users/register',
                { username, password, role: 'employee' }, // Optional role, adjust if needed
                { headers: { 'Content-Type': 'application/json' } }
            );

            console.log('Registration Success:', response.data);
            setToken(response.data.token); // Save the token in state
            localStorage.setItem('token', response.data.token); // Store token in localStorage
            navigateToPayments(); // Redirect to the payment page
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
        <div className="register-container">
            <h2 className="register-title">Register</h2>
            <form className="register-form" onSubmit={handleRegister}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    className="register-input"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="register-input"
                />
                <button type="submit" className="register-button">Register</button>
                {message && <p className="register-message">{message}</p>}
            </form>
        </div>
    );
};

export default Register;