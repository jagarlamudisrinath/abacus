import React from 'react';
import { WeakAreaAnalysis } from '../../services/progress.api';
import './WeakAreasCard.css';

interface WeakAreasCardProps {
  areas: WeakAreaAnalysis[];
}

export default function WeakAreasCard({ areas }: WeakAreasCardProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <span className="trend-icon improving">↑</span>;
      case 'declining':
        return <span className="trend-icon declining">↓</span>;
      default:
        return <span className="trend-icon stable">→</span>;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'good';
    if (score >= 50) return 'average';
    return 'poor';
  };

  if (areas.length === 0) {
    return (
      <div className="weak-areas empty">
        <p>Great job! No weak areas detected.</p>
      </div>
    );
  }

  return (
    <div className="weak-areas">
      <div className="areas-list">
        {areas.map((area) => (
          <div key={area.practiceSheetId} className="area-item">
            <div className="area-info">
              <span className="area-name">{area.practiceSheetName}</span>
              <span className="area-sessions">{area.sessionsAttempted} sessions</span>
            </div>
            <div className="area-stats">
              <span className={`area-score ${getScoreColor(area.averageScore)}`}>
                {Math.round(area.averageScore)}%
              </span>
              {getTrendIcon(area.trend)}
            </div>
          </div>
        ))}
      </div>
      <p className="weak-areas-tip">
        Focus on these sheets to improve your overall performance.
      </p>
    </div>
  );
}
