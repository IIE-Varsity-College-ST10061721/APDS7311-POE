import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployeeDashboard.css'; // Import the CSS for styling

const TransactionDashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setMessage('No token found');
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/transactions', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setTransactions(response.data);
            } catch (error) {
                console.error("Error fetching transactions:", error);
                setMessage('Failed to load transactions');
            }
        };

        fetchTransactions();
    }, []);

    const handleVerify = async (transactionId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage('No token found');
                return;
            }

            const response = await axios.put(
                `http://localhost:5000/api/transactions/verify/${transactionId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('Transaction verified successfully!');
            setTransactions(prev =>
                prev.map(transaction =>
                    transaction._id === transactionId ? { ...transaction, status: 'Verified' } : transaction
                )
            );
        } catch (error) {
            setMessage('Verification failed');
        }
    };

    const handleSubmitToSwift = async (transactionId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage('No token found');
                return;
            }

            const response = await axios.put(
                `http://localhost:5000/api/transactions/submit-to-swift/${transactionId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('Transaction submitted to SWIFT successfully!');
            setTransactions(prev =>
                prev.map(transaction =>
                    transaction._id === transactionId ? { ...transaction, status: 'Submitted to SWIFT' } : transaction
                )
            );
        } catch (error) {
            setMessage('Submission failed');
        }
    };

    return (
        <div className="transaction-dashboard-container">
            <h2>Employee Transaction Dashboard</h2>
            {message && <p className="message">{message}</p>}
            <div className="transaction-list">
                {transactions.map((transaction) => (
                    <div key={transaction._id} className="transaction-card">
                        <p><strong>Payee:</strong> {transaction.payeeAccountNumber}</p>
                        <p><strong>Amount:</strong> {transaction.amount} {transaction.currency}</p>
                        <p><strong>Status:</strong> {transaction.status}</p>
                        <div className="button-group">
                            <button
                                className="verify-button"
                                onClick={() => handleVerify(transaction._id)}
                                disabled={transaction.status === 'Verified'}
                            >
                                Verify
                            </button>
                            <button
                                className="submit-button"
                                onClick={() => handleSubmitToSwift(transaction._id)}
                                disabled={transaction.status === 'Submitted to SWIFT'}
                            >
                                Submit to SWIFT
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransactionDashboard;
