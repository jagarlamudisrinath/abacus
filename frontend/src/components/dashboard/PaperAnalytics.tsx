import React, { useState, useEffect } from 'react';
import {
  fetchAttemptedPapers,
  fetchPaperAnalytics,
  AttemptedPaper,
  PaperAnalytics as PaperAnalyticsData,
} from '../../services/progress.api';
import SessionDetailModal from './SessionDetailModal';
import './PaperAnalytics.css';

type DateRange = 'week' | 'month' | 'all';

export default function PaperAnalytics() {
  const [attemptedPapers, setAttemptedPapers] = useState<AttemptedPaper[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [analytics, setAnalytics] = useState<PaperAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadAttemptedPapers();
  }, []);

  useEffect(() => {
    if (selectedPaperId) {
      loadAnalytics();
    }
  }, [selectedPaperId, dateRange]);

  const loadAttemptedPapers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const papers = await fetchAttemptedPapers();
      setAttemptedPapers(papers);
      if (papers.length > 0) {
        setSelectedPaperId(papers[0].practiceSheetId);
      }
    } catch (err) {
      setError('Failed to load practice papers');
      console.error('Error loading attempted papers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    if (!selectedPaperId) return;
    try {
      setIsLoadingAnalytics(true);
      const data = await fetchPaperAnalytics(selectedPaperId, dateRange);
      setAnalytics(data);
    } catch (err) {
      console.error('Error loading paper analytics:', err);
      setAnalytics(null);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <span className="trend-icon improving">&#8593;</span>;
      case 'declining':
        return <span className="trend-icon declining">&#8595;</span>;
      default:
        return <span className="trend-icon stable">&#8594;</span>;
    }
  };

  const getComparisonIcon = (comparison: 'above' | 'below' | 'equal', avgScore: number, score: number) => {
    const diff = score - avgScore;
    if (comparison === 'above') {
      return <span className="comparison above">+{diff.toFixed(1)}%</span>;
    } else if (comparison === 'below') {
      return <span className="comparison below">{diff.toFixed(1)}%</span>;
    }
    return <span className="comparison equal">avg</span>;
  };

  const handleSessionClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleCloseModal = () => {
    setSelectedSessionId(null);
  };

  if (isLoading) {
    return (
      <div className="paper-analytics loading">
        <p>Loading practice papers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="paper-analytics error">
        <p>{error}</p>
      </div>
    );
  }

  if (attemptedPapers.length === 0) {
    return (
      <div className="paper-analytics empty">
        <p>No practice sessions yet. Complete a session to see paper analytics.</p>
      </div>
    );
  }

  return (
    <div className="paper-analytics">
      <div className="paper-analytics-controls">
        <div className="control-group">
          <label htmlFor="paper-select">Select Paper:</label>
          <select
            id="paper-select"
            value={selectedPaperId}
            onChange={(e) => setSelectedPaperId(e.target.value)}
          >
            {attemptedPapers.map((paper) => (
              <option key={paper.practiceSheetId} value={paper.practiceSheetId}>
                {paper.practiceSheetName} ({paper.sessionCount} sessions)
              </option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label htmlFor="date-range">Date Range:</label>
          <select
            id="date-range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {isLoadingAnalytics ? (
        <div className="paper-analytics-loading">
          <p>Loading analytics...</p>
        </div>
      ) : analytics ? (
        <>
          <div className="paper-stats-grid">
            <div className="paper-stat-card">
              <div className="paper-stat-icon sessions">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="paper-stat-value">{analytics.totalSessions}</div>
              <div className="paper-stat-label">Sessions</div>
            </div>

            <div className="paper-stat-card">
              <div className="paper-stat-icon average">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
              <div className="paper-stat-value">{Math.round(analytics.averageScore)}%</div>
              <div className="paper-stat-label">Avg Score</div>
            </div>

            <div className="paper-stat-card">
              <div className="paper-stat-icon best">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <div className="paper-stat-value">{Math.round(analytics.bestScore)}%</div>
              <div className="paper-stat-label">Best Score</div>
            </div>

            <div className="paper-stat-card">
              <div className="paper-stat-icon time">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className="paper-stat-value">{formatTime(analytics.averageTimeTaken)}</div>
              <div className="paper-stat-label">Avg Time</div>
            </div>

            <div className="paper-stat-card">
              <div className={`paper-stat-icon trend ${analytics.trend}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
              </div>
              <div className="paper-stat-value">{getTrendIcon(analytics.trend)}</div>
              <div className="paper-stat-label">Trend</div>
            </div>
          </div>

          {analytics.scoreTrend.length > 1 && (
            <div className="paper-score-chart">
              <h4>Score History</h4>
              <div className="mini-chart">
                {analytics.scoreTrend.map((point, index) => (
                  <div
                    key={index}
                    className="chart-bar"
                    style={{ height: `${point.score}%` }}
                    title={`${formatDate(point.date)}: ${Math.round(point.score)}%`}
                  >
                    <span className="chart-bar-label">{Math.round(point.score)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="paper-sessions-table">
            <h4>Session History</h4>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Correct</th>
                  <th>Time</th>
                  <th>vs Avg</th>
                </tr>
              </thead>
              <tbody>
                {analytics.sessions.map((session) => (
                  <tr
                    key={session.sessionId}
                    onClick={() => handleSessionClick(session.sessionId)}
                  >
                    <td>{formatDate(session.completedAt)}</td>
                    <td className={`score ${session.score >= 80 ? 'excellent' : session.score >= 60 ? 'good' : session.score >= 40 ? 'average' : 'poor'}`}>
                      {Math.round(session.score)}%
                    </td>
                    <td>{session.correct}/{session.totalQuestions}</td>
                    <td>{formatTime(session.timeTaken)}</td>
                    <td>{getComparisonIcon(session.comparedToAverage, analytics.averageScore, session.score)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="paper-analytics-empty">
          <p>No data available for the selected date range.</p>
        </div>
      )}

      {selectedSessionId && (
        <SessionDetailModal
          sessionId={selectedSessionId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
