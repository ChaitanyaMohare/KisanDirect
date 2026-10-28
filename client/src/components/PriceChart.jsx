import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
        <p style={{ fontWeight: 600, margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>{label}</p>
        <p style={{ fontWeight: 800, margin: '4px 0 0', color: 'var(--green-primary)', fontSize: '16px' }}>
          ₹{payload[0].value.toLocaleString('en-IN')}
        </p>
      </div>
    );
  }
  return null;
};

export function PriceLineChart({ data, dataKey = 'price', xKey = 'date' }) {
  if (!data || data.length === 0) return null;

  const formatted = data.map(d => ({
    ...d,
    [xKey]: d[xKey] ? new Date(d[xKey]).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : d[xKey]
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: '#888' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `₹${(v / 1000).toFixed(1)}k`}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="var(--green-primary)"
          strokeWidth={2.5}
          dot={{ fill: 'var(--green-primary)', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function EarningsBarChart({ data }) {
  if (!data || data.length === 0) return null;

  const EarningsTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
          <p style={{ fontWeight: 600, margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</p>
          <p style={{ fontWeight: 800, margin: '4px 0 0', color: 'var(--green-primary)' }}>
            ₹{payload[0].value.toLocaleString('en-IN')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 10, fill: '#888' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
          width={40}
        />
        <Tooltip content={<EarningsTooltip />} />
        <Bar dataKey="earnings" fill="var(--green-primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default PriceLineChart;
