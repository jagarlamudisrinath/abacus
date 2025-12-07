import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendDataPoint } from '../../services/progress.api';
import './ScoreChart.css';

interface ScoreChartProps {
  data: TrendDataPoint[];
}

export default function ScoreChart({ data }: ScoreChartProps) {
  if (data.length === 0) {
    return (
      <div className="score-chart empty">
        <p>No data yet. Complete a practice session to see your progress!</p>
      </div>
    );
  }

  const formattedData = data.map((point) => ({
    ...point,
    date: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="score-chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#a0aec0"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            stroke="#a0aec0"
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
            formatter={(value: number, name: string) => [
              `${Math.round(value)}%`,
              name === 'score' ? 'Score' : 'Accuracy',
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="score"
            name="Score"
            stroke="#667eea"
            strokeWidth={2}
            dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            name="Accuracy"
            stroke="#48bb78"
            strokeWidth={2}
            dot={{ fill: '#48bb78', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
