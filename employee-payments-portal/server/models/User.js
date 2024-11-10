const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: { 
        type: String, 
        enum: ['user'], 
        required: true 
    }, // Enum for roles
    accountNumber: {
        type: String,
        unique: true,
    }
});

// Method to hash the password before saving the user
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        console.log('Hashing password for user:', this.username); // Debugging log
        this.password = await bcrypt.hash(this.password, 10);
    }
    
    // Generate account number if it doesn't exist
    if (!this.accountNumber) {
        console.log('Generating account number for user:', this.username); // Debugging log
        const hash = crypto.createHash('sha256').update(this._id.toString()).digest('hex');
        this.accountNumber = 'AC' + hash.substring(0, 10).toUpperCase(); // Prefix with 'AC' and truncate
    }

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
