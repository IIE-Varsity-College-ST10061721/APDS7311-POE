const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Apply Helmet for basic security headers
const setSecurityHeaders = helmet();  // Use helmet directly as middleware

// HSTS (HTTP Strict Transport Security) configuration
const hstsMiddleware = helmet.hsts({
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
});

// Rate limiter to limit repeated requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many requests from this IP, please try again later." // Custom message for rate-limited responses
});

module.exports = {
    setSecurityHeaders,
    hstsMiddleware,
    limiter,
};

