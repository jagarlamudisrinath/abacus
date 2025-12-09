import React from 'react';
import { IntervalStats } from '../../types';
import './IntervalModal.css';

interface IntervalModalProps {
  isOpen: boolean;
  intervalNumber: number;
  intervalMinutes: number;
  currentStats: {
    attempted: number;
    correct: number;
    incorrect: number;
    avgTime: number;
  };
  totalStats: {
    attempted: number;
    correct: number;
    incorrect: number;
    avgTime: number;
    totalQuestions: number;
  };
  previousIntervals: IntervalStats[];
  onResume: () => void;
}

export default function IntervalModal({
  isOpen,
  intervalNumber,
  intervalMinutes,
  currentStats,
  totalStats,
  previousIntervals,
  onResume,
}: IntervalModalProps) {
  if (!isOpen) return null;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const currentAccuracy = currentStats.attempted > 0
    ? Math.round((currentStats.correct / currentStats.attempted) * 100)
    : 0;

  const totalAccuracy = totalStats.attempted > 0
    ? Math.round((totalStats.correct / totalStats.attempted) * 100)
    : 0;

  // Use previousIntervals directly - it already includes the current interval that was just saved
  const allIntervals = previousIntervals;

  return (
    <div className="interval-modal-overlay">
      <div className="interval-modal">
        <div className="interval-modal-header">
          <span className="pause-icon">⏸️</span>
          <h2>{intervalMinutes}-Minute Checkpoint</h2>
          <p>Interval {intervalNumber} Complete</p>
        </div>

        <div className="interval-stats-section">
          <div className="stats-block current">
            <h3>This Interval ({intervalMinutes} min)</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{currentStats.attempted}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-item correct">
                <span className="stat-value">{currentStats.correct}</span>
                <span className="stat-label">Correct</span>
              </div>
              <div className="stat-item incorrect">
                <span className="stat-value">{currentStats.incorrect}</span>
                <span className="stat-label">Wrong</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formatTime(currentStats.avgTime)}</span>
                <span className="stat-label">Avg/Sum</span>
              </div>
            </div>
            <div className="accuracy-bar">
              <div className="accuracy-fill" style={{ width: `${currentAccuracy}%` }} />
              <span className="accuracy-text">{currentAccuracy}% Accuracy</span>
            </div>
          </div>

          <div className="stats-block total">
            <h3>Running Total</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{totalStats.attempted}/{totalStats.totalQuestions}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-item correct">
                <span className="stat-value">{totalStats.correct}</span>
                <span className="stat-label">Correct</span>
              </div>
              <div className="stat-item incorrect">
                <span className="stat-value">{totalStats.incorrect}</span>
                <span className="stat-label">Wrong</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formatTime(totalStats.avgTime)}</span>
                <span className="stat-label">Avg/Sum</span>
              </div>
            </div>
            <div className="accuracy-bar">
              <div className="accuracy-fill" style={{ width: `${totalAccuracy}%` }} />
              <span className="accuracy-text">{totalAccuracy}% Accuracy</span>
            </div>
          </div>
        </div>

        {allIntervals.length > 1 && (
          <div className="interval-history">
            <h3>All Intervals</h3>
            <table className="interval-table">
              <thead>
                <tr>
                  <th>Interval</th>
                  <th>Completed</th>
                  <th>Correct</th>
                  <th>Wrong</th>
                  <th>Accuracy</th>
                  <th>Avg/Sum</th>
                </tr>
              </thead>
              <tbody>
                {allIntervals.map((interval, idx) => {
                  const acc = interval.questionsAttempted > 0
                    ? Math.round((interval.correct / interval.questionsAttempted) * 100)
                    : 0;
                  return (
                    <tr key={idx} className={idx === allIntervals.length - 1 ? 'current-row' : ''}>
                      <td>{interval.intervalNumber}</td>
                      <td>{interval.questionsAttempted}</td>
                      <td className="correct">{interval.correct}</td>
                      <td className="incorrect">{interval.incorrect}</td>
                      <td>{acc}%</td>
                      <td>{formatTime(interval.avgTimePerQuestion)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <button className="resume-btn" onClick={onResume}>
          <span className="play-icon">▶️</span>
          Resume Practice
        </button>
      </div>
    </div>
  );
}
