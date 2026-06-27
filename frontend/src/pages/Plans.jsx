import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PlanCard from '../components/PlanCard';
import './Plans.css';

const Plans = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState(searchParams.get('operator') || '');
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const operators = ['All', 'Jio', 'Airtel', 'Vi', 'BSNL'];
  const planTypes = ['all', 'prepaid', 'postpaid', 'data', 'topup'];

  useEffect(() => {
    if (selectedOperator) {
      fetchPlans();
    }
  }, [selectedOperator, filterType]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/plans';
      const params = [];
      if (selectedOperator && selectedOperator !== 'All') {
        params.push(`operator=${selectedOperator}`);
      }
      if (filterType && filterType !== 'all') {
        params.push(`type=${filterType}`);
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const res = await axios.get(url);
      setPlans(res.data);
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOperatorChange = (operator) => {
    setSelectedOperator(operator);
    navigate(`/plans?operator=${operator}`);
  };

  const handleRecharge = (plan) => {
    navigate('/recharge', { state: { selectedPlan: plan } });
  };

  return (
    <div className="plans-container">
      <div className="plans-header">
        <h2>📶 Available Plans</h2>
        <p>Choose the best plan for your needs</p>
      </div>

      <div className="filters-section">
        <div className="operator-filters">
          <span className="filter-label">Operator:</span>
          {operators.map(op => (
            <button
              key={op}
              className={`filter-btn ${selectedOperator === op || (op === 'All' && !selectedOperator) ? 'active' : ''}`}
              onClick={() => handleOperatorChange(op === 'All' ? '' : op)}
            >
              {op}
            </button>
          ))}
        </div>

        <div className="type-filters">
          <span className="filter-label">Type:</span>
          {planTypes.map(type => (
            <button
              key={type}
              className={`filter-btn ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading plans...</div>
      ) : (
        <div className="plans-grid">
          {plans.length === 0 ? (
            <div className="no-plans">
              <p>No plans available for this operator</p>
            </div>
          ) : (
            plans.map(plan => (
              <div key={plan._id} className="plan-wrapper">
                <PlanCard plan={plan} />
                <button 
                  className="recharge-now-btn"
                  onClick={() => handleRecharge(plan)}
                >
                  Recharge Now
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Plans;