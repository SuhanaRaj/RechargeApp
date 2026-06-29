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
  const [showConfirm, setShowConfirm] = useState(false); // NEW: For confirmation dialog

  useEffect(() => {
    if (formData.operator) {
      fetchPlans(formData.operator);
    } else {
      setPlans([]);
      setSelectedPlan(null);
    }
  }, [formData.operator]);

  const fetchPlans = async (operator) => {
    try {
      const res = await axios.get(`/api/plans/operator/${operator}`);
      setPlans(res.data);
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  const handlePlanSelect = (plan) => {
    if (selectedPlan?.id === plan.id) {
      setSelectedPlan(null);
      setFormData({
        ...formData,
        planId: '',
        amount: '',
        validity: '',
        data: '',
        talktime: ''
      });
      return;
    }
    
    setSelectedPlan(plan);
    setFormData({
      ...formData,
      planId: plan.id,
      amount: plan.amount,
      validity: plan.validity,
      data: plan.data || '',
      talktime: plan.talktime || ''
    });
    setMessage('');
    setShowConfirm(false);
  };

  // NEW: Show confirmation dialog
  const handleProceedToConfirm = (e) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      setMessage('Please select a plan first');
      setMessageType('error');
      return;
    }

    if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
      setMessage('Please enter a valid 10-digit mobile number');
      setMessageType('error');
      return;
    }

    if (user.walletBalance < formData.amount) {
      setMessage('Insufficient wallet balance. Please add money to your wallet.');
      setMessageType('error');
      return;
    }

    // Show confirmation dialog
    setShowConfirm(true);
    setMessage('');
  };

  // NEW: Handle actual recharge after confirmation
  const handleConfirmRecharge = async () => {
    setLoading(true);
    setShowConfirm(false);
    setMessage('');
    setMessageType('');

    try {
      const res = await axios.post('/api/recharge', formData);
      console.log('Recharge response:', res.data);
      
      setMessage(`Recharge successful! Transaction ID: ${res.data.transactionId}`);
      setMessageType('success');
      
      // Update local user balance
      if (user) {
        user.walletBalance = res.data.newBalance;
      }
      
      // Wait 3 seconds before redirecting to history
      setTimeout(() => {
        setSelectedPlan(null);
        setFormData({
          mobileNumber: '',
          operator: '',
          planId: '',
          amount: '',
          validity: '',
          data: '',
          talktime: ''
        });
        navigate('/history');
      }, 3000); // 3 seconds delay
      
    } catch (err) {
      console.error('Recharge error:', err);
      setMessage(err.response?.data?.msg || 'Recharge failed. Please try again.');
      setMessageType('error');
      setLoading(false);
    }
  };

  // NEW: Cancel confirmation
  const handleCancelConfirm = () => {
    setShowConfirm(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'operator') {
      setSelectedPlan(null);
      setPlans([]);
      setShowConfirm(false);
    }
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
      
      <form onSubmit={handleProceedToConfirm} className="recharge-form">
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
              maxLength="10"
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
            <h4>Available Plans ({plans.length})</h4>
            <div className="plans-grid">
              {plans.map(plan => {
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`plan-card ${isSelected ? 'selected' : ''}`}
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
                        {plan.benefits.slice(0, 2).map((benefit, index) => (
                          <span key={index} className="benefit-tag">✓ {benefit}</span>
                        ))}
                      </div>
                    )}
                    <button 
                      className={`select-plan-btn ${isSelected ? 'selected' : ''}`}
                      type="button"
                    >
                      {isSelected ? '✓ Selected' : 'Select'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedPlan && (
          <div className="selected-plan-summary">
            <h4>Selected Plan Summary</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Plan</span>
                <span className="value">{selectedPlan.name}</span>
              </div>
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

        <button 
          type="submit" 
          disabled={loading || !selectedPlan} 
          className="recharge-btn"
        >
          {loading ? '⏳ Processing...' : selectedPlan ? `Recharge ₹${formData.amount}` : 'Select a Plan First'}
        </button>

        {message && !showConfirm && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
      </form>

      {/* NEW: Confirmation Dialog */}
      {showConfirm && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <div className="confirmation-header">
              <h3>📱 Confirm Recharge</h3>
              <button className="close-btn" onClick={handleCancelConfirm}>✕</button>
            </div>
            <div className="confirmation-body">
              <div className="confirm-details">
                <div className="confirm-row">
                  <span className="confirm-label">Mobile Number:</span>
                  <span className="confirm-value">{formData.mobileNumber}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-label">Operator:</span>
                  <span className="confirm-value">{formData.operator}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-label">Plan:</span>
                  <span className="confirm-value">{selectedPlan?.name}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-label">Amount:</span>
                  <span className="confirm-value amount">₹{formData.amount}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-label">Validity:</span>
                  <span className="confirm-value">{formData.validity}</span>
                </div>
                {formData.data && (
                  <div className="confirm-row">
                    <span className="confirm-label">Data:</span>
                    <span className="confirm-value">{formData.data}</span>
                  </div>
                )}
                <div className="confirm-divider"></div>
                <div className="confirm-row total">
                  <span className="confirm-label">Wallet Balance:</span>
                  <span className="confirm-value">₹{user?.walletBalance || 0}</span>
                </div>
                <div className="confirm-row total">
                  <span className="confirm-label">After Recharge:</span>
                  <span className="confirm-value">₹{(user?.walletBalance || 0) - (formData.amount || 0)}</span>
                </div>
              </div>
            </div>
            <div className="confirmation-footer">
              <button className="cancel-btn" onClick={handleCancelConfirm}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleConfirmRecharge} disabled={loading}>
                {loading ? 'Processing...' : 'Confirm & Recharge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recharge;