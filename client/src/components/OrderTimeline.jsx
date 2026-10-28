import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function OrderTimeline({ timeline }) {
  const { t } = useLanguage();

  const getStatusKey = (step) => {
    const map = {
      'Buyer Request': 'buyer_request',
      'Price Accepted': 'price_accepted',
      'Pickup Scheduled': 'pickup_scheduled',
      'In Transit': 'in_transit',
      'Completed': 'completed',
    };
    return map[step] || step;
  };

  return (
    <div className="order-timeline">
      {timeline.map((step, idx) => (
        <div key={idx} className={`timeline-step ${step.status}`}>
          <div className={`timeline-dot ${step.status}`}>
            {step.status === 'completed' ? '✓' : step.status === 'active' ? '→' : idx + 1}
          </div>
          <div className="timeline-content">
            <div className="timeline-title">{t(getStatusKey(step.step))}</div>
            {step.note && <div className="timeline-note">{step.note}</div>}
            {step.date && (
              <div className="timeline-date">
                {new Date(step.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
