// /controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

// Regular expression for username and password validation
const usernameRegex = /^[a-zA-Z0-9._@-]{3,30}$/; // Alphanumeric, dots, underscores, hyphens; 3 to 30 characters
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; // Secure password

const login = async (username, password) => {
    try {
        // Whitelist input for username
        if (!usernameRegex.test(username)) {
            throw new Error('Username must be between 3 and 30 characters and can only contain letters, numbers, dots, underscores, and hyphens.');
        }

        // Whitelist input for password
        if (!passwordRegex.test(password)) {
            throw new Error('Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.');
        }

        // Find the user in the database
        const user = await User.findOne({ username });
        if (!user) {
            throw new Error('Invalid username or password');
        }

        console.log('User found:', user.username); // Logging found user

        // Compare the plain password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Plain Password:', password); // Log the provided plain password
        console.log('Stored Hashed Password:', user.password); // Log the stored hashed password
        console.log('Password Match:', isMatch); // Log match result

        if (!isMatch) {
            throw new Error('Invalid password');
        }

        // User authentication is successful, generate a token
        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return { user, token };
    } catch (error) {
        console.error('Login error:', error.message);
        throw error; // Rethrow or handle as needed
    }
};

module.exports = { login };
