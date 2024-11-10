const express = require('express');
const { check, validationResult } = require('express-validator');
const { checkAuth } = require('../middleware/auth'); // Assuming you already have a middleware for token verification
const Transaction = require('../models/Transactions'); // Your Transaction model

const router = express.Router();

router.get('/', checkAuth, async (req, res) => {
    console.log("User Role:", req.user.role); // Check if role is correctly identified
    try {
        // Ensure the logged-in user has the "employee" role
        if (req.user.role !== 'employee') {
            return res.status(403).json({ message: 'Access denied: You must be an employee' });
        }

        const transactions = await Transaction.find(); // Fetch all transactions
        res.json(transactions); // Send transactions as a JSON response
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        res.status(500).json({ message: 'Failed to load transactions' });
    }
});


// Verify a transaction (change status to "Verified")
router.put(
    '/verify/:transactionId',
    checkAuth,
    [
        check('transactionId').isMongoId().withMessage('Invalid transaction ID'),
    ],
    async (req, res) => {
        // Handle validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Ensure the logged-in user has the "employee" role
        if (req.user.role !== 'employee') {
            return res.status(403).json({ message: 'Access denied: You must be an employee to verify transactions' });
        }

        try {
            const transaction = await Transaction.findById(req.params.transactionId);
            if (!transaction) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            transaction.status = 'Verified';
            await transaction.save();
            res.json({ message: 'Transaction verified successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to verify transaction' });
        }
    }
);

// Submit a verified transaction to SWIFT (change status to "Submitted to SWIFT")
router.put(
    '/submit-to-swift/:transactionId',
    checkAuth,
    [
        check('transactionId').isMongoId().withMessage('Invalid transaction ID'),
    ],
    async (req, res) => {
        // Handle validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Ensure the logged-in user has the "employee" role
        if (req.user.role !== 'employee') {
            return res.status(403).json({ message: 'Access denied: You must be an employee to submit transactions to SWIFT' });
        }

        try {
            const transaction = await Transaction.findById(req.params.transactionId);
            if (!transaction) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            if (transaction.status !== 'Verified') {
                return res.status(400).json({ message: 'Transaction must be verified before submitting to SWIFT' });
            }

            transaction.status = 'Submitted to SWIFT';
            await transaction.save();
            res.json({ message: 'Transaction successfully submitted to SWIFT' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to submit transaction to SWIFT' });
        }
    }
);

module.exports = router;
