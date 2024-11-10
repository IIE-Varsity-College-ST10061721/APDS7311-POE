// controllers/paymentController.js
const Payment = require('../models/Payment');
const Transaction = require('../models/Transactions');
const User = require('../models/User'); // Import the User model

const createPayment = async (req, res) => {
    console.log('Received payment data:', req.body);
    const { amount, currency, swiftCode, recipientAccountNumber } = req.body;

    // Validate input
    if (!amount || !currency || !swiftCode || !recipientAccountNumber) {
        return res.status(400).json({ message: 'All fields are required: amount, currency, swift code, recipient account number' });
    }

    // Ensure amount is a positive number
    const amountNumber = Number(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    // Ensure currency is in uppercase
    const formattedCurrency = currency.toUpperCase();

    try {
        // Fetch the authenticated user's account number (payeeAccountNumber)
        const user = await User.findById(req.user.userId); // req.user.userId should be the authenticated user's ID
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create the Transaction document first
        const newTransaction = new Transaction({
            payeeAccountNumber: user.accountNumber, // Use the user's account number
            amount: amountNumber,
            currency: formattedCurrency,
            swiftCode,
            status: 'Pending'
        });
        await newTransaction.save();

        // Create and save the Payment document, including transactionId
        const newPayment = new Payment({
            userId: req.user.userId, // Ensure userId is assigned from req.user (authentication middleware)
            amount: amountNumber,
            currency: formattedCurrency,
            swiftCode,
            recipientAccountNumber,
            transactionId: newTransaction._id  // Save the transaction reference
        });
        await newPayment.save();

        res.status(201).json({
            message: 'Payment and Transaction created successfully!',
            payment: newPayment,
            transaction: newTransaction
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(500).json({
            message: 'Internal Server Error: Could not create payment and transaction',
            error: {
                name: error.name,
                message: error.message
            }
        });
    }
};

// controllers/paymentController.js
const getPayments = async (req, res) => {
    try {
        console.log('User ID:', req.user.userId); // Log the user ID for debugging

        const payments = await Payment.find({ userId: req.user.userId }).populate('transactionId');
        
        console.log('Payments found:', payments); // Log payments to ensure they are returned

        if (!payments.length) {
            return res.status(404).json({ message: 'No payments found' });
        }

        res.status(200).json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Internal Server Error: Could not fetch payments' });
    }
};

module.exports = { createPayment, getPayments };
