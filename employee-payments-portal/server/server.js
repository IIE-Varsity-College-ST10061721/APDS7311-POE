require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const connectDB = require('./config/db');
const userController = require('./controllers/userController');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes'); // Import transaction routes
const { setSecurityHeaders, hstsMiddleware, limiter } = require('./middleware/security');

const app = express();

// Ensure critical environment variables are set
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI', 'CLIENT_ORIGIN'];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

// Database connection
connectDB()
  .then(() => console.log('MongoDB connected successfully.'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Middleware setup
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

// Security middleware
app.use(setSecurityHeaders);
app.use(hstsMiddleware);
app.use(limiter);

app.use((req, res, next) => {
    console.log("Received headers:", req.headers);
    next();
});


// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.url}`);
    next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);

// Login route (POST)
app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for username: ${username}`);

    if (!username || !password) {
        console.warn('Login attempt missing username or password');
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const { user, token } = await userController.login(username, password);
        
        if (!user) {
            console.warn(`User not found for username: ${username}`);
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        console.log(`User ${username} logged in successfully`);

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(`Login failed for username: ${username}. Error: ${error.message}`);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
});

// Set up HTTPS for production, fallback to HTTP for development
const PORT = process.env.PORT || 5000;
let server;

if (process.env.NODE_ENV === 'production') {
    if (!process.env.SSL_KEY_PATH || !process.env.SSL_CERT_PATH) {
        console.error('SSL_KEY_PATH and SSL_CERT_PATH are required in production');
        process.exit(1);
    }

    const sslOptions = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH)
    };

    server = https.createServer(sslOptions, app).listen(PORT, () => {
        console.log(`Secure server running on HTTPS port ${PORT}`);
    });
} else {
    server = app.listen(PORT, () => {
        console.log(`Server running on HTTP port ${PORT}`);
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
