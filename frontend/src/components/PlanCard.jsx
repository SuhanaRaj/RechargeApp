import React from 'react';
import './PlanCard.css';

const PlanCard = ({ plan, onSelect, isSelected }) => {
  return (
    <div 
      className={`plan-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(plan)}
    >
      <div className="plan-amount">₹{plan.amount}</div>
      <div className="plan-name">{plan.name}</div>
      <div className="plan-validity">📅 {plan.validity}</div>
      {plan.data && <div className="plan-data">📶 {plan.data}</div>}
      {plan.talktime && <div className="plan-talktime">📞 {plan.talktime}</div>}
      {plan.sms && <div className="plan-sms">💬 {plan.sms}</div>}
      {plan.benefits && plan.benefits.length > 0 && (
        <div className="plan-benefits">
          {plan.benefits.map((benefit, index) => (
            <span key={index} className="benefit-tag">✓ {benefit}</span>
          ))}
        </div>
      )}
      <button className="select-plan-btn">
        {isSelected ? 'Selected' : 'Select Plan'}
      </button>
    </div>
  );
};

export default PlanCard;