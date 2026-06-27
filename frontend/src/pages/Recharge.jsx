import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Recharge.css';

const Recharge = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    mobileNumber: '',
    operator: '',
    planId: '',
    amount: '',
    validity: '',
    data: '',
    talktime: ''
  });
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (formData.operator) {
      fetchPlans(formData.operator);
    }
  }, [formData.operator]);

  const fetchPlans = async (operator) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/plans/operator/${operator}`);
      setPlans(res.data);
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      ...formData,
      planId: plan._id,
      amount: plan.amount,
      validity: plan.validity,
      data: plan.data || '',
      talktime: plan.talktime || ''
    });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    // Validate wallet balance
    if (user.walletBalance < formData.amount) {
      setMessage('Insufficient wallet balance. Please add money to your wallet.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/recharge', formData);
      setMessage(`✅ Recharge successful! Transaction ID: ${res.data.transactionId}`);
      setMessageType('success');
      
      // Update local user balance
      user.walletBalance = res.data.newBalance;
      
      setTimeout(() => navigate('/history'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.msg || '❌ Recharge failed. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="recharge-container">
      <div className="recharge-header">
        <h2>📱 Mobile Recharge</h2>
        <div className="wallet-info">
          <span>Wallet Balance: </span>
          <span className="wallet-amount">₹{user?.walletBalance || 0}</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="recharge-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Enter 10-digit mobile number"
              required
              pattern="[0-9]{10}"
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label>Operator</label>
            <select
              name="operator"
              value={formData.operator}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">Select Operator</option>
              <option value="Jio">📱 Jio</option>
              <option value="Airtel">📶 Airtel</option>
              <option value="Vi">📞 Vi</option>
              <option value="BSNL">🌐 BSNL</option>
            </select>
          </div>
        </div>

        {plans.length > 0 && (
          <div className="plans-section">
            <h4>Available Plans</h4>
            <div className="plans-grid">
              {plans.map(plan => (
                <div
                  key={plan._id}
                  className={`plan-card ${selectedPlan?._id === plan._id ? 'selected' : ''}`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  <div className="plan-amount">₹{plan.amount}</div>
                  <div className="plan-name">{plan.name}</div>
                  <div className="plan-validity">📅 {plan.validity}</div>
                  {plan.data && <div className="plan-detail">📶 {plan.data}</div>}
                  {plan.talktime && <div className="plan-detail">📞 {plan.talktime}</div>}
                  {plan.sms && <div className="plan-detail">💬 {plan.sms}</div>}
                  {plan.benefits && plan.benefits.length > 0 && (
                    <div className="plan-benefits">
                      {plan.benefits.slice(0, 3).map((benefit, index) => (
                        <span key={index} className="benefit-tag">✓ {benefit}</span>
                      ))}
                    </div>
                  )}
                  <button 
                    className={`select-plan-btn ${selectedPlan?._id === plan._id ? 'selected' : ''}`}
                    type="button"
                  >
                    {selectedPlan?._id === plan._id ? '✓ Selected' : 'Select'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedPlan && (
          <div className="selected-plan-summary">
            <h4>Plan Summary</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Amount</span>
                <span className="value">₹{selectedPlan.amount}</span>
              </div>
              <div className="summary-item">
                <span className="label">Validity</span>
                <span className="value">{selectedPlan.validity}</span>
              </div>
              {selectedPlan.data && (
                <div className="summary-item">
                  <span className="label">Data</span>
                  <span className="value">{selectedPlan.data}</span>
                </div>
              )}
              {selectedPlan.talktime && (
                <div className="summary-item">
                  <span className="label">Talktime</span>
                  <span className="value">{selectedPlan.talktime}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <button type="submit" disabled={loading || !selectedPlan} className="recharge-btn">
          {loading ? '⏳ Processing...' : `💰 Recharge Now ₹${formData.amount || 0}`}
        </button>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default Recharge;