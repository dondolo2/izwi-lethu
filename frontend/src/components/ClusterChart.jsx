import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'];

const ClusterChart = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!data || data.length === 0) {
    return (
      <div className={`
        text-center py-10 rounded-2xl shadow-sm border transition-all duration-300 p-8
        ${isDark ? 'bg-[#1a1a2e] border-[#1e293b]' : 'bg-white border-gray-100'}
      `}>
        <TrendingUp size={48} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
        <p style={{ color: 'var(--text-secondary)' }}>No stories archived yet.</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Send a voice note via WhatsApp to get started!</p>
      </div>
    );
  }

  return (
    <div className={`
      p-4 rounded-2xl shadow-sm border transition-all duration-300
      ${isDark ? 'bg-[#1a1a2e] border-[#1e293b]' : 'bg-white border-gray-100'}
    `}>
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
        <TrendingUp size={16} className="text-neon-500" />
        Story Themes
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? '#1a1a2e' : '#fff',
                borderColor: isDark ? '#1e293b' : '#e5e7eb',
                color: isDark ? '#f1f5f9' : '#1a1a2e'
              }}
            />
            <Legend 
              formatter={(value) => <span style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClusterChart;