// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User model if needed later

const checkAuth = (req, res, next) => {
    // Retrieve the token from the Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        console.warn('Authorization header is missing');
        return res.status(401).json({ message: "Unauthorized: Authorization header is missing" });
    }

    const token = authHeader.split(' ')[1]; // Extract the token after 'Bearer'
    if (!token) {
        console.warn('Token is missing from Authorization header');
        return res.status(401).json({ message: "Unauthorized: Token is missing" });
    }

    try {
        // Verify the token using the secret key from the environment
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Log the decoded token payload for debugging
        console.log('Decoded token payload:', decoded);

        // Ensure the decoded token includes user information and set req.user
        if (!decoded || !decoded.userId || !decoded.role) {
            console.error('Decoded token does not contain user information or role');
            return res.status(401).json({ message: "Unauthorized: Invalid token payload" });
        }

        // Attach the decoded user information and role to the req.user object
        req.user = { userId: decoded.userId, role: decoded.role };
        console.log(`User authenticated: ${req.user.userId} with role: ${req.user.role}`); // Log the user ID and role

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Log the error details if token verification fails
        console.error('Token verification failed:', error.message);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

module.exports = { checkAuth };
