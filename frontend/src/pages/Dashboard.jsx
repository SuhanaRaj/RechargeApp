import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentRecharges, setRecentRecharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRecharges: 0,
    totalSpent: 0,
    operatorCounts: {}
  });

  const operators = [
    { name: 'Jio', icon: '📱', color: '#E50914' },
    { name: 'Airtel', icon: '📶', color: '#FF9933' },
    { name: 'Vi', icon: '📞', color: '#800080' },
    { name: 'BSNL', icon: '🌐', color: '#008000' }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/recharge/history');
      const recharges = res.data;
      setRecentRecharges(recharges.slice(0, 5));
      
      // Calculate stats
      const totalRecharges = recharges.length;
      const totalSpent = recharges.reduce((sum, r) => sum + r.amount, 0);
      const operatorCounts = recharges.reduce((acc, r) => {
        acc[r.operator] = (acc[r.operator] || 0) + 1;
        return acc;
      }, {});
      
      setStats({ totalRecharges, totalSpent, operatorCounts });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Stay connected with RechargeHub</p>
        </div>
        <div className="quick-actions">
          <Link to="/recharge" className="quick-action-btn primary">
            Quick Recharge
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">₹{user?.walletBalance || 0}</div>
            <div className="stat-label">Wallet Balance</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalRecharges}</div>
            <div className="stat-label">Total Recharges</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div className="stat-info">
            <div className="stat-value">₹{stats.totalSpent}</div>
            <div className="stat-label">Total Spent</div>
          </div>
        </div>
      </div>

      {/* Quick Recharge - Operators */}
      <div className="quick-recharge">
        <h3>Quick Recharge</h3>
        <div className="operator-grid">
          {operators.map(op => (
            <Link to={`/plans?operator=${op.name}`} key={op.name} className="operator-card">
              <div className="operator-icon" style={{ background: op.color }}>
                {op.icon}
              </div>
              <span>{op.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Recharges */}
      <div className="recent-recharges">
        <div className="section-header">
          <h3>Recent Recharges</h3>
          <Link to="/history" className="view-all">View All</Link>
        </div>
        {recentRecharges.length === 0 ? (
          <div className="empty-state">
            <p>No recent recharges</p>
            <Link to="/recharge" className="empty-action">Make your first recharge</Link>
          </div>
        ) : (
          <div className="recharge-list">
            {recentRecharges.map(recharge => (
              <div key={recharge._id} className="recharge-item">
                <div className="recharge-info">
                  <div className="mobile-info">
                    <span className="mobile-number">{recharge.mobileNumber}</span>
                    <span className="operator-tag">{recharge.operator}</span>
                  </div>
                  <div className="plan-info">
                    <span className="plan-name">{recharge.planId?.name || 'Plan'}</span>
                    <span className="validity">{recharge.validity}</span>
                  </div>
                </div>
                <div className="recharge-amount">
                  <span className="amount">₹{recharge.amount}</span>
                  <span className={`status ${recharge.status}`}>
                    {recharge.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;