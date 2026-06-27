import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Wallet.css';

const Wallet = () => {
  const { user, setUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const predefinedAmounts = [100, 200, 500, 1000, 2000];

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setMessage('Please enter a valid amount');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const res = await axios.post('http://localhost:5000/api/recharge/add-money', {
        amount: parseFloat(amount)
      });
      
      setMessage(`✅ ₹${amount} added successfully to your wallet!`);
      setMessageType('success');
      
      // Update user context
      setUser({
        ...user,
        walletBalance: res.data.newBalance
      });
      
      setAmount('');
    } catch (err) {
      setMessage(err.response?.data?.msg || '❌ Failed to add money');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <h2>💰 Wallet</h2>
      </div>

      <div className="wallet-balance-card">
        <div className="balance-label">Current Balance</div>
        <div className="balance-amount">₹{user?.walletBalance || 0}</div>
      </div>

      <div className="add-money-section">
        <h3>Add Money to Wallet</h3>
        <form onSubmit={handleAddMoney}>
          <div className="amount-input-group">
            <div className="predefined-amounts">
              {predefinedAmounts.map(amt => (
                <button
                  key={amt}
                  type="button"
                  className={`amount-btn ${parseFloat(amount) === amt ? 'active' : ''}`}
                  onClick={() => setAmount(amt.toString())}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <div className="custom-amount">
              <label>Or enter custom amount</label>
              <div className="input-wrapper">
                <span className="currency-symbol">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="1"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="add-money-btn" disabled={loading}>
            {loading ? '⏳ Processing...' : '💳 Add Money'}
          </button>
        </form>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
      </div>

      <div className="wallet-info">
        <h4>💡 Wallet Information</h4>
        <ul>
          <li>• Minimum recharge amount: ₹1</li>
          <li>• No transaction fees</li>
          <li>• Money added instantly</li>
          <li>• Use wallet balance for all recharges</li>
        </ul>
      </div>
    </div>
  );
};

export default Wallet;