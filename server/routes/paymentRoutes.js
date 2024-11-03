const express = require('express');
const { checkAuth } = require('../middleware/auth');
const { createPayment, getPayments } = require('../controllers/paymentController');
const { check, validationResult } = require('express-validator');

const router = express.Router();

router.get('/', checkAuth, getPayments);

router.post(
    '/',
    checkAuth,
    [
        check('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
        check('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
        check('swiftCode').isLength({ min: 8, max: 11 }).withMessage('SWIFT code must be between 8 and 11 characters'),
        check('recipientAccountNumber').notEmpty().withMessage('Recipient account number is required'),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    createPayment
);

module.exports = router;
