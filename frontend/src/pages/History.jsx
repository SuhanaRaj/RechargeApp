import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RechargeHistoryItem from '../components/RechargeHistoryItem';
import './History.css';

const History = () => {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/recharge/history');
      setRecharges(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecharges = recharges.filter(recharge => {
    const matchesFilter = filter === 'all' || recharge.status === filter;
    const matchesSearch = recharge.mobileNumber.includes(searchTerm) || 
                         recharge.transactionId.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <div className="loading">Loading history...</div>;
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>📋 Recharge History</h2>
        <div className="history-stats">
          <div className="stat">
            <span className="stat-label">Total Recharges</span>
            <span className="stat-value">{recharges.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Amount</span>
            <span className="stat-value">₹{recharges.reduce((sum, r) => sum + r.amount, 0)}</span>
          </div>
        </div>
      </div>

      <div className="history-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by mobile or transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'success' ? 'active' : ''}`}
            onClick={() => setFilter('success')}
          >
            Success
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${filter === 'failed' ? 'active' : ''}`}
            onClick={() => setFilter('failed')}
          >
            Failed
          </button>
        </div>
      </div>

      {filteredRecharges.length === 0 ? (
        <div className="empty-history">
          <div className="empty-icon">📭</div>
          <h3>No Recharges Found</h3>
          <p>You haven't made any recharges yet</p>
          <button className="recharge-now" onClick={() => window.location.href = '/recharge'}>
            Make Your First Recharge
          </button>
        </div>
      ) : (
        <div className="history-list">
          {filteredRecharges.map(recharge => (
            <RechargeHistoryItem key={recharge._id} recharge={recharge} />
          ))}
        </div>
      )}
    </div>
  );
};

export default History;