import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Payments.css'; // Import the CSS file for styling

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [formData, setFormData] = useState({ amount: '', currency: '', swiftCode: '', recipientAccountNumber: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.warn("Token is missing in localStorage");
                    return;
                }
        
                const response = await axios.get('http://localhost:5000/api/payments', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setPayments(response.data); // Update payments state with fetched data
            } catch (error) {
                console.error('Error fetching payments:', error);
            }
        };

        fetchPayments();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true); // Set loading state to true when submitting
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/payments', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Payment created successfully!');
            setPayments((prev) => [...prev, response.data]); // Update the payments state
            setFormData({ amount: '', currency: '', swiftCode: '', recipientAccountNumber: '' }); // Reset form fields
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || 'Payment failed.';
            setError(`Error ${err.response?.status}: ${message}`);
        } finally {
            setLoading(false); // Reset loading state after request completes
        }
    };

    return (
        <div className="payments-container">
            <h1>Payments</h1>
            <div className="payments-layout">
                <div className="payment-form-container">
                    <form onSubmit={handlePayment} className="payment-form">
                        <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="Amount" required />
                        <input type="text" name="currency" value={formData.currency} onChange={handleInputChange} placeholder="Currency (e.g., USD)" required />
                        <input type="text" name="swiftCode" value={formData.swiftCode} onChange={handleInputChange} placeholder="SWIFT Code" required />
                        <input type="text" name="recipientAccountNumber" value={formData.recipientAccountNumber} onChange={handleInputChange} placeholder="Recipient Account" required />
                        <button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Submit Payment'}</button>
                        {error && <p className="error-message">{error}</p>}
                        {success && <p className="success-message">{success}</p>}
                    </form>
                </div>
                <div className="payment-history-container">
    <h2>Payment History</h2>
    {payments.length > 0 ? (
        <ul className="payment-history">
            {payments.map((payment, index) => (
                <li key={index} className="payment-item">
                    <p>Amount: {payment.amount}</p>
                    <p>Currency: {payment.currency}</p>
                    <p>SWIFT Code: {payment.swiftCode}</p>
                    <p>Recipient Account: {payment.recipientAccountNumber}</p>
                </li>
            ))}
        </ul>
    ) : (
        <p>No payments found.</p>
    )}
</div>
            </div>
        </div>
    );
};

export default Payments;
