import React from 'react';
import { TestResult, IntervalStats } from '../../types';
import './ResultsScreen.css';

type ReviewFilter = 'wrong' | 'unanswered';

interface ResultsScreenProps {
  result: TestResult;
  onRetry: () => void;
  onHome: () => void;
  onReview?: (filter: ReviewFilter) => void;
}

export default function ResultsScreen({ result, onRetry, onHome, onReview }: ResultsScreenProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'needs-improvement';
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatAvgTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  // Calculate average time per question (only for attempted questions)
  const avgTimePerQuestion = result.attempted > 0
    ? result.timeTaken / result.attempted
    : 0;

  return (
    <div className="results-screen">
      <div className="results-card">
        <div className="results-header">
          <h1>Test Complete!</h1>
          <p>Here's how you performed</p>
        </div>

        <div className={`score-circle ${getScoreColor(result.score)}`}>
          <span className="score-value">{Math.round(result.score)}%</span>
          <span className="score-label">Score</span>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon correct">✓</span>
            <span className="stat-number">{result.correct}</span>
            <span className="stat-name">Correct</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon incorrect">✗</span>
            <span className="stat-number">{result.incorrect}</span>
            <span className="stat-name">Incorrect</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon unanswered">—</span>
            <span className="stat-number">{result.unanswered}</span>
            <span className="stat-name">Unanswered</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon time">⏱</span>
            <span className="stat-number">{formatTime(result.timeTaken)}</span>
            <span className="stat-name">Time Taken</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon total">📝</span>
            <span className="stat-number">{result.attempted}/{result.totalQuestions}</span>
            <span className="stat-name">Sums Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon avg">⚡</span>
            <span className="stat-number">{formatAvgTime(avgTimePerQuestion)}</span>
            <span className="stat-name">Avg per Sum</span>
          </div>
        </div>

        <div className="section-results">
          <h2>Section Breakdown</h2>
          {result.sectionResults.map((section, index) => (
            <div key={section.sectionId} className="section-result">
              <div className="section-header">
                <span className="section-number">{index + 1}</span>
                <span className="section-name">{section.sectionName}</span>
              </div>
              <div className="section-stats">
                <span className="section-score">
                  {section.correct}/{section.total}
                </span>
                <div className="section-bar">
                  <div
                    className="section-bar-fill"
                    style={{ width: `${section.accuracy}%` }}
                  />
                </div>
                <span className="section-accuracy">{Math.round(section.accuracy)}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Interval Breakdown */}
        {result.intervals && result.intervals.length > 0 && (
          <div className="interval-breakdown">
            <h2>Interval Breakdown</h2>
            <table className="interval-results-table">
              <thead>
                <tr>
                  <th>Interval</th>
                  <th>Time</th>
                  <th>Completed</th>
                  <th>Correct</th>
                  <th>Wrong</th>
                  <th>Accuracy</th>
                  <th>Avg/Sum</th>
                </tr>
              </thead>
              <tbody>
                {result.intervals.map((interval: IntervalStats) => {
                  const accuracy = interval.questionsAttempted > 0
                    ? Math.round((interval.correct / interval.questionsAttempted) * 100)
                    : 0;
                  return (
                    <tr key={interval.intervalNumber}>
                      <td>{interval.intervalNumber}</td>
                      <td>{formatTime(interval.startTime)} - {formatTime(interval.endTime)}</td>
                      <td>{interval.questionsAttempted}</td>
                      <td className="correct-cell">{interval.correct}</td>
                      <td className="incorrect-cell">{interval.incorrect}</td>
                      <td>{accuracy}%</td>
                      <td>{formatAvgTime(interval.avgTimePerQuestion)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Review Actions */}
        {onReview && (result.incorrect > 0 || result.unanswered > 0) && (
          <div className="review-actions">
            <h2>Review Questions</h2>
            <div className="review-buttons">
              {result.incorrect > 0 && (
                <button
                  className="btn btn-review wrong"
                  onClick={() => onReview('wrong')}
                >
                  <span className="review-icon">✗</span>
                  Review Wrong Questions
                  <span className="review-count">{result.incorrect}</span>
                </button>
              )}
              {result.unanswered > 0 && (
                <button
                  className="btn btn-review unanswered"
                  onClick={() => onReview('unanswered')}
                >
                  <span className="review-icon">—</span>
                  Review Unanswered
                  <span className="review-count">{result.unanswered}</span>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="results-actions">
          <button className="btn btn-secondary" onClick={onHome}>
            Back to Home
          </button>
          <button className="btn btn-primary" onClick={onRetry}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
