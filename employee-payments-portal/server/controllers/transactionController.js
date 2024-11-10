// controllers/transactionController.js
const Transaction = require('../models/Transactions');

// Verify transaction
const verifyTransaction = async (req, res) => {
    const { transactionId } = req.params;
    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });

        transaction.status = 'Verified';
        await transaction.save();
        console.log(`Transaction ${transactionId} verified by user ${req.user.userId}`);
        res.json({ message: 'Transaction verified', transaction });
    } catch (error) {
        console.error(`Error verifying transaction ${transactionId}: ${error.message}`);
        res.status(500).json({ message: "Error verifying transaction" });
    }
};

// Submit transaction to SWIFT
const submitToSwift = async (req, res) => {
    const { transactionId } = req.params;
    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });

        transaction.status = 'Submitted';
        await transaction.save();
        console.log(`Transaction ${transactionId} submitted to SWIFT by user ${req.user.userId}`);
        res.json({ message: 'Transaction submitted to SWIFT', transaction });
    } catch (error) {
        console.error(`Error submitting transaction ${transactionId} to SWIFT: ${error.message}`);
        res.status(500).json({ message: "Error submitting transaction" });
    }
};

module.exports = { verifyTransaction, submitToSwift };
