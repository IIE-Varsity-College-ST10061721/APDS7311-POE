const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
        default: 'user',
    },
});

// Method to hash the password before saving the user
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        console.log('Hashing password for user:', this.username); // Debugging log
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});


const User = mongoose.model('User', userSchema);

module.exports = User;
