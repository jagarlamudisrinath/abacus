import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { IntervalTrendAnalysis } from '../../services/progress.api';
import './IntervalAnalysis.css';

interface IntervalAnalysisProps {
  data: IntervalTrendAnalysis[];
}

export default function IntervalAnalysis({ data }: IntervalAnalysisProps) {
  if (data.length === 0) {
    return (
      <div className="interval-analysis empty">
        <p>Complete longer sessions to see interval analysis.</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    interval: `Int ${item.intervalNumber}`,
    Questions: Math.round(item.averageQuestionsAttempted),
    Accuracy: Math.round(item.averageAccuracy),
  }));

  return (
    <div className="interval-analysis">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="interval" tick={{ fontSize: 12 }} stroke="#a0aec0" />
          <YAxis tick={{ fontSize: 12 }} stroke="#a0aec0" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
          <Legend />
          <Bar dataKey="Questions" fill="#667eea" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Accuracy" fill="#48bb78" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="interval-tip">
        Review your performance across check-in intervals. Watch for accuracy drops in later intervals.
      </p>
    </div>
  );
}
