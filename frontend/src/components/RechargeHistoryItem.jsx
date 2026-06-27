import React from 'react';

const RechargeHistoryItem = ({ recharge }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="history-item">
      <div className="history-header">
        <div className="history-mobile">
          <span className="mobile-icon">📱</span>
          <span className="mobile-number">{recharge.mobileNumber}</span>
          <span className="operator-badge">{recharge.operator}</span>
        </div>
        <div className="history-amount">
          <span className="amount">₹{recharge.amount}</span>
          <span className={`status-badge ${recharge.status}`}>
            {recharge.status.charAt(0).toUpperCase() + recharge.status.slice(1)}
          </span>
        </div>
      </div>
      <div className="history-details">
        <div className="history-plan">
          <span className="label">Plan:</span>
          <span className="value">{recharge.planId?.name || 'N/A'}</span>
        </div>
        <div className="history-validity">
          <span className="label">Validity:</span>
          <span className="value">{recharge.validity}</span>
        </div>
        {recharge.data && (
          <div className="history-data">
            <span className="label">Data:</span>
            <span className="value">{recharge.data}</span>
          </div>
        )}
        {recharge.talktime && (
          <div className="history-talktime">
            <span className="label">Talktime:</span>
            <span className="value">{recharge.talktime}</span>
          </div>
        )}
        <div className="history-transaction">
          <span className="label">Transaction ID:</span>
          <span className="value transaction-id">{recharge.transactionId}</span>
        </div>
        <div className="history-date">
          <span className="label">Date:</span>
          <span className="value">{formatDate(recharge.rechargeDate)}</span>
        </div>
      </div>
    </div>
  );
};

export default RechargeHistoryItem;