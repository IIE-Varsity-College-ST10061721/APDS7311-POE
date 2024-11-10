// /controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const crypto = require('crypto');

// Regular expressions for validation
const usernameRegex = /^[a-zA-Z0-9._@-]{3,30}$/; // Alphanumeric, dots, underscores, hyphens; 3 to 30 characters
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; // Secure password
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format validation

const generateAccountNumber = (userId) => {
    const hash = crypto.createHash('sha256').update(userId).digest('hex');
    return 'AC' + hash.substring(0, 10).toUpperCase(); // Prefix with 'AC' and truncate to 10 chars
};

// Register function
const register = async (username, email, password) => {
    try {
        // Validate username, email, and password
        if (!usernameRegex.test(username)) {
            throw new Error('Username must be between 3 and 30 characters and can only contain letters, numbers, dots, underscores, and hyphens.');
        }
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
        if (!passwordRegex.test(password)) {
            throw new Error('Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.');
        }

        // Check if username or email already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) throw new Error('Username already taken');
        const existingEmail = await User.findOne({ email });
        if (existingEmail) throw new Error('Email already in use');

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with role 'user' and generate account number
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'user',
        });
        newUser.accountNumber = generateAccountNumber(newUser._id.toString());

        // Save user to the database
        await newUser.save();

        // Generate token
        const token = jwt.sign(
            { userId: newUser._id, username: newUser.username, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return { newUser, token };
    } catch (error) {
        console.error('Register error:', error.message);
        throw error;
    }
};

// Login function
const login = async (username, password) => {
    try {
        // Validate username and password formats
        if (!usernameRegex.test(username)) {
            throw new Error('Username must be between 3 and 30 characters and can only contain letters, numbers, dots, underscores, and hyphens.');
        }
        if (!passwordRegex.test(password)) {
            throw new Error('Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.');
        }

        // Find the user in the database
        const user = await User.findOne({ username });
        if (!user) throw new Error('Invalid username or password');

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid password');

        // Generate token
        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return { user, token };
    } catch (error) {
        console.error('Login error:', error.message);
        throw error;
    }
};

module.exports = { register, login };
