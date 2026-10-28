import React from 'react';

export default function StatCard({ icon, label, value, color = '#e8f5e9', iconBg = 'var(--green-light)', trend }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {trend !== undefined && (
          <div style={{ fontSize: '12px', marginTop: '4px', color: trend >= 0 ? 'var(--green-primary)' : 'var(--red-alert)', fontWeight: 600 }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}
