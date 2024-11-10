const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { checkAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');  // To limit login attempts

const router = express.Router();

// Password strength validation regex (example: at least one lowercase, one uppercase, one number, one special character, and min 8 characters)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Username validation regex (alphanumeric and underscore only)
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

// Rate limiter to prevent brute force attacks
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many login attempts. Please try again later.'
});

// POST request for user registration
// POST request for user registration
router.post('/register', async (req, res) => {
    let { username, password } = req.body;

    // Trim username and password to avoid leading/trailing spaces
    username = username.trim();
    password = password.trim();

    // Validate username and password with regex
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // Log to see what is being sent
    console.log('Username:', username);
    console.log('Password:', password);

    // Check if username matches the allowed pattern
    if (!usernameRegex.test(username)) {
        return res.status(400).json({ message: 'Username must be alphanumeric with underscores, 3-20 characters long' });
    }

    // Check if password matches the strength requirement
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long, contain uppercase, lowercase, a number, and a special character' });
    }

    try {
        // Check if the user already exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // Salting and hashing the password

        // Create new user with 'user' role (hardcoded)
        const newUser = new User({
            username,
            password: hashedPassword,
            role: 'user', // Hardcode the role to 'user'
        });

        // Save the new user
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser._id, username: newUser.username, role: newUser.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );

        // Send the token to the client
        res.status(201).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// POST request for user login
router.post('/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Compare password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );

        // Return user and token
        res.json({ user, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Employee Dashboard route (protected)
router.get('/employee/dashboard', checkAuth, (req, res) => {
    if (req.user.role === 'employee') {
        res.json({ message: 'Welcome to the Employee Dashboard' });
    } else {
        res.status(403).json({ message: 'Access forbidden: Employees only' });
    }
});

module.exports = router;
