console.log("Starting the createUser script...");

require('dotenv').config();
console.log("Environment variables loaded.");
console.log("MONGODB_URI:", process.env.MONGODB_URI);

const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path if necessary
const connectDB = require('./config/db'); // Adjust path if necessary
const bcrypt = require('bcrypt');

// Connect to the database
connectDB()
    .then(() => {
        console.log("Database connected.");
        // Start the user creation process here
        return createUser('allowedUser1', 'StrongPass@123');
    })
    .catch(err => {
        console.error("Database connection error:", err);
        process.exit(1); // Exit the process if the database connection fails
    });

// Define a regex pattern for a strong password
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Create User Function Example
const createUser = async (username, password) => {
    try {
        // Check if password meets the regex requirement
        if (!passwordRegex.test(password)) {
            throw new Error('Password does not meet the required complexity.');
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            throw new Error('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(`Creating user ${username} with hashed password: ${hashedPassword}`); // Log the hashed password
        
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        console.log(`User ${username} created successfully.`);
    } catch (error) {
        console.error("Error creating user:", error.message);
    }
};
