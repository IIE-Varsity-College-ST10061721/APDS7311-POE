const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Assuming User model is already set up
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    swiftCode: {
        type: String,
        required: true
    },
    recipientAccountNumber: {
        type: String,
        required: true
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',  // Reference to the Transaction model
        required: true
    }
});

module.exports = mongoose.model('Payment', PaymentSchema);
