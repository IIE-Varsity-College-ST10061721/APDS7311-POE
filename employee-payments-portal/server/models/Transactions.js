// models/Transactions.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    payeeAccountNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    swiftCode: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Verified', 'Submitted to SWIFT'],
        default: 'Pending'
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);
