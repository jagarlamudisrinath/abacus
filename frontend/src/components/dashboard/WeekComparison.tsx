import React, { useState, useEffect } from 'react';
import { fetchComparison, ComparisonData } from '../../services/progress.api';
import './WeekComparison.css';

export default function WeekComparison() {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComparison();
  }, []);

  const loadComparison = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const comparisonData = await fetchComparison();
      setData(comparisonData);
    } catch (err) {
      setError('Failed to load comparison data');
      console.error('Comparison error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const calculateChange = (current: number, previous: number): { value: number; direction: 'up' | 'down' | 'same' } => {
    if (previous === 0) {
      return { value: current > 0 ? 100 : 0, direction: current > 0 ? 'up' : 'same' };
    }
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      direction: change > 1 ? 'up' : change < -1 ? 'down' : 'same',
    };
  };

  const renderMetric = (
    label: string,
    thisWeek: number,
    lastWeek: number,
    formatter: (n: number) => string = (n) => n.toString(),
    higherIsBetter: boolean = true
  ) => {
    const change = calculateChange(thisWeek, lastWeek);
    const isImprovement = higherIsBetter ? change.direction === 'up' : change.direction === 'down';
    const isDecline = higherIsBetter ? change.direction === 'down' : change.direction === 'up';

    return (
      <div className="comparison-metric">
        <span className="metric-label">{label}</span>
        <div className="metric-values">
          <div className="metric-current">
            <span className="metric-value">{formatter(thisWeek)}</span>
            {change.direction !== 'same' && (
              <span className={`metric-change ${isImprovement ? 'positive' : isDecline ? 'negative' : ''}`}>
                {change.direction === 'up' ? '↑' : '↓'} {change.value.toFixed(0)}%
              </span>
            )}
          </div>
          <div className="metric-previous">
            <span className="metric-label-small">Last week:</span>
            <span className="metric-value-small">{formatter(lastWeek)}</span>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="week-comparison loading">
        <h2>This Week vs Last Week</h2>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="week-comparison error">
        <h2>This Week vs Last Week</h2>
        <div className="error-text">{error || 'No data available'}</div>
      </div>
    );
  }

  return (
    <div className="week-comparison">
      <h2>This Week vs Last Week</h2>
      <div className="comparison-grid">
        {renderMetric('Sessions', data.thisWeek.sessions, data.lastWeek.sessions)}
        {renderMetric('Questions', data.thisWeek.questions, data.lastWeek.questions)}
        {renderMetric('Accuracy', data.thisWeek.accuracy, data.lastWeek.accuracy, (n) => `${n.toFixed(1)}%`)}
        {renderMetric('Avg Score', data.thisWeek.averageScore, data.lastWeek.averageScore, (n) => `${n.toFixed(1)}%`)}
        {renderMetric('Time Spent', data.thisWeek.timeSpent, data.lastWeek.timeSpent, formatTime)}
      </div>
    </div>
  );
}
