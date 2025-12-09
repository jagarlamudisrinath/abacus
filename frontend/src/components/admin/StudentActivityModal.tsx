import React, { useState, useEffect } from 'react';
import {
  fetchStudentDashboard,
  fetchStudentSessionDetail,
  fetchClassComparisonStats,
  StudentSummary,
  ClassComparisonStats,
} from '../../services/admin.api';
import {
  DashboardData,
  SessionSummary,
  SessionDetail,
} from '../../services/progress.api';
import StatsOverview from '../dashboard/StatsOverview';
import ScoreChart from '../dashboard/ScoreChart';
import TeacherPaperAnalysis from './TeacherPaperAnalysis';
import './StudentActivityModal.css';

interface StudentActivityModalProps {
  student: StudentSummary;
  onClose: () => void;
}

export default function StudentActivityModal({ student, onClose }: StudentActivityModalProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [classStats, setClassStats] = useState<ClassComparisonStats | null>(null);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, [student.id]);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const dashboardData = await fetchStudentDashboard(student.id);
      setData(dashboardData);
    } catch (err) {
      setError('Failed to load student activity. Please try again.');
      console.error('Dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionClick = async (sessionId: string) => {
    try {
      setLoadingSessionId(sessionId);
      // Fetch session detail and class comparison stats in parallel
      const [detail, stats] = await Promise.all([
        fetchStudentSessionDetail(student.id, sessionId),
        fetchClassComparisonStats(student.id, sessionId).catch(() => null), // Don't fail if stats unavailable
      ]);
      setSelectedSession(detail);
      setClassStats(stats);
    } catch (err) {
      console.error('Failed to load session details:', err);
    } finally {
      setLoadingSessionId(null);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (selectedSession) {
        setSelectedSession(null);
      } else {
        onClose();
      }
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedSession) {
          setSelectedSession(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, selectedSession]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  };

  const formatLastPractice = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="modal-overlay student-activity-overlay" onClick={handleOverlayClick}>
      <div className="student-activity-modal">
        <div className="modal-header">
          <div className="header-info">
            <h2>{student.name}'s Activity</h2>
            {student.studentId && <span className="student-id">{student.studentId}</span>}
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {isLoading && (
          <div className="modal-loading">
            <span>Loading student activity...</span>
          </div>
        )}

        {error && (
          <div className="modal-error">
            <span>{error}</span>
            <button className="btn btn-primary btn-sm" onClick={loadDashboard}>
              Try Again
            </button>
          </div>
        )}

        {data && !isLoading && (
          <div className="modal-body">
            {/* Streak and Stats */}
            <div className="activity-header">
              <div className="streak-badge">
                <span className="streak-icon">🔥</span>
                <span className="streak-count">{data.streakDays}</span>
                <span className="streak-label">day streak</span>
              </div>
              <span className="last-practice">
                Last practice: {formatLastPractice(data.lastPracticeDate)}
              </span>
            </div>

            {/* Stats Overview */}
            <StatsOverview stats={data.stats} />

            {/* Score Chart */}
            {data.scoreTrend.length > 0 && (
              <div className="section">
                <h3>Score Trend</h3>
                <ScoreChart data={data.scoreTrend} />
              </div>
            )}

            {/* Recent Sessions */}
            <div className="section">
              <h3>Recent Sessions</h3>
              {data.stats.recentSessions.length === 0 ? (
                <div className="empty-sessions">
                  <p>No practice sessions yet.</p>
                </div>
              ) : (
                <div className="sessions-list">
                  {data.stats.recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`session-item clickable ${loadingSessionId === session.id ? 'loading' : ''}`}
                      onClick={() => handleSessionClick(session.id)}
                    >
                      <div className="session-main">
                        <div className="session-info">
                          <span className="session-name">{session.practiceSheetName}</span>
                          <span className="session-date">{formatDate(session.completedAt)}</span>
                        </div>
                        <div className={`session-score ${getScoreColor(session.score)}`}>
                          {Math.round(session.score)}%
                        </div>
                      </div>
                      <div className="session-details">
                        <span className="detail">
                          <span className="detail-label">Correct:</span>
                          <span className="detail-value correct">{session.correct}/{session.total}</span>
                        </span>
                        <span className="detail">
                          <span className="detail-label">Time:</span>
                          <span className="detail-value">{formatTime(session.timeTaken)}</span>
                        </span>
                        <span className="detail">
                          <span className="detail-label">Mode:</span>
                          <span className="detail-value">{session.mode}</span>
                        </span>
                      </div>
                      {loadingSessionId === session.id ? (
                        <div className="view-details-hint">Loading...</div>
                      ) : (
                        <div className="view-details-hint">Click to view details</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weak Areas */}
            {data.weakAreas.length > 0 && (
              <div className="section">
                <h3>Areas to Improve</h3>
                <div className="weak-areas-list">
                  {data.weakAreas.map((area) => (
                    <div key={area.practiceSheetId} className="weak-area-item">
                      <span className="area-name">{area.practiceSheetName}</span>
                      <div className="area-stats">
                        <span className={`area-score ${getScoreColor(area.averageScore)}`}>
                          {Math.round(area.averageScore)}%
                        </span>
                        <span className={`trend-badge ${area.trend}`}>
                          {area.trend === 'improving' && '↑'}
                          {area.trend === 'declining' && '↓'}
                          {area.trend === 'stable' && '→'}
                          {area.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

{/* Teacher Paper Analysis Modal */}
        {selectedSession && (
          <TeacherPaperAnalysis
            session={selectedSession}
            student={student}
            onClose={() => {
              setSelectedSession(null);
              setClassStats(null);
            }}
            classStats={classStats ? {
              averageScore: classStats.classAverageScore,
              totalStudents: classStats.totalStudentsAttempted,
              studentRank: classStats.studentRank,
              averageTime: classStats.classAverageTime,
            } : undefined}
          />
        )}
      </div>
    </div>
  );
}
