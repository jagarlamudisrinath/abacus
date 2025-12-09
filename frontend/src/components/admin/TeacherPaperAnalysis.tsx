import React, { useState, useMemo } from 'react';
import { SessionDetail } from '../../services/progress.api';
import { StudentSummary } from '../../services/admin.api';
import './TeacherPaperAnalysis.css';

type TabType = 'overview' | 'questions' | 'insights';
type QuestionFilter = 'all' | 'wrong' | 'unanswered' | 'correct';

interface TeacherPaperAnalysisProps {
  session: SessionDetail;
  student: StudentSummary;
  onClose: () => void;
  classStats?: {
    averageScore: number;
    totalStudents: number;
    studentRank: number;
    averageTime: number;
  };
}

export default function TeacherPaperAnalysis({
  session,
  student,
  onClose,
  classStats,
}: TeacherPaperAnalysisProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [questionFilter, setQuestionFilter] = useState<QuestionFilter>('all');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter questions based on current filter
  const filteredQuestions = useMemo(() => {
    if (!session.responses) return [];

    return session.responses.filter((response) => {
      switch (questionFilter) {
        case 'wrong':
          return response.isCorrect === false;
        case 'unanswered':
          return response.userAnswer === null || response.userAnswer === '';
        case 'correct':
          return response.isCorrect === true;
        default:
          return true;
      }
    });
  }, [session.responses, questionFilter]);

  // Count questions by type
  const questionCounts = useMemo(() => {
    if (!session.responses) return { all: 0, wrong: 0, unanswered: 0, correct: 0 };

    return {
      all: session.responses.length,
      wrong: session.responses.filter((r) => r.isCorrect === false).length,
      unanswered: session.responses.filter((r) => r.userAnswer === null || r.userAnswer === '').length,
      correct: session.responses.filter((r) => r.isCorrect === true).length,
    };
  }, [session.responses]);

  // Calculate average time per question
  const avgTimePerQuestion = session.attempted > 0
    ? session.timeTaken / session.attempted
    : 0;

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Reset question index when filter changes
  const handleFilterChange = (filter: QuestionFilter) => {
    setQuestionFilter(filter);
    setCurrentQuestionIndex(0);
  };

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  return (
    <div className="teacher-paper-analysis-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="teacher-paper-analysis">
        {/* Header */}
        <header className="analysis-header">
          <div className="header-content">
            <button className="back-btn" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
            <div className="header-info">
              <h1>{student.name}</h1>
              <div className="session-meta">
                <span className="sheet-name">{session.practiceSheetName}</span>
                <span className="divider">-</span>
                <span className={`mode-badge ${session.mode}`}>{session.mode}</span>
                <span className="divider">-</span>
                <span className="date">{formatDate(session.completedAt)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <nav className="analysis-tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Student View
          </button>
          <button
            className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            Question Review
          </button>
          <button
            className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            Teacher Insights
          </button>
        </nav>

        {/* Tab Content */}
        <div className="analysis-content">
          {/* Student View Tab */}
          {activeTab === 'overview' && (
            <div className="overview-tab">
              {/* Score Circle */}
              <div className="score-section">
                <div className={`score-circle ${getScoreColor(session.score)}`}>
                  <span className="score-value">{Math.round(session.score)}%</span>
                  <span className="score-label">Score</span>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-icon correct">&#10003;</span>
                    <span className="stat-number">{session.correct}</span>
                    <span className="stat-name">Correct</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon incorrect">&#10007;</span>
                    <span className="stat-number">{session.incorrect}</span>
                    <span className="stat-name">Incorrect</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon unanswered">-</span>
                    <span className="stat-number">{session.total - session.attempted}</span>
                    <span className="stat-name">Unanswered</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon time">&#9201;</span>
                    <span className="stat-number">{formatTime(session.timeTaken)}</span>
                    <span className="stat-name">Time Taken</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon total">&#128221;</span>
                    <span className="stat-number">{session.attempted}/{session.total}</span>
                    <span className="stat-name">Completed</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon avg">&#9889;</span>
                    <span className="stat-number">{formatAvgTime(avgTimePerQuestion)}</span>
                    <span className="stat-name">Avg per Sum</span>
                  </div>
                </div>
              </div>

              {/* Section Breakdown */}
              {session.sectionResults && session.sectionResults.length > 0 && (
                <div className="section-breakdown">
                  <h2>Section Breakdown</h2>
                  {session.sectionResults.map((section, index) => (
                    <div key={section.sectionId} className="section-result">
                      <div className="section-header">
                        <span className="section-number">{index + 1}</span>
                        <span className="section-name">{section.sectionName}</span>
                      </div>
                      <div className="section-stats">
                        <span className="section-score">{section.correct}/{section.total}</span>
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
              )}

              {/* Interval Performance */}
              {session.intervals && session.intervals.length > 0 && (
                <div className="interval-breakdown">
                  <h2>7-Minute Interval Breakdown</h2>
                  <table className="interval-table">
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
                      {session.intervals.map((interval) => {
                        const accuracy = interval.questionsAttempted > 0
                          ? Math.round((interval.correct / interval.questionsAttempted) * 100)
                          : 0;
                        return (
                          <tr key={interval.intervalNumber}>
                            <td>{interval.intervalNumber}</td>
                            <td>{formatTime(interval.startTime)} - {formatTime(interval.endTime)}</td>
                            <td>{interval.questionsAttempted}</td>
                            <td className="correct">{interval.correct}</td>
                            <td className="incorrect">{interval.incorrect}</td>
                            <td>{accuracy}%</td>
                            <td>{formatAvgTime(interval.avgTimePerQuestion)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Question Review Tab */}
          {activeTab === 'questions' && (
            <div className="questions-tab">
              {/* Filter Buttons */}
              <div className="question-filters">
                <button
                  className={`filter-btn ${questionFilter === 'all' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('all')}
                >
                  All ({questionCounts.all})
                </button>
                <button
                  className={`filter-btn wrong ${questionFilter === 'wrong' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('wrong')}
                >
                  Wrong ({questionCounts.wrong})
                </button>
                <button
                  className={`filter-btn unanswered ${questionFilter === 'unanswered' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('unanswered')}
                >
                  Unanswered ({questionCounts.unanswered})
                </button>
                <button
                  className={`filter-btn correct ${questionFilter === 'correct' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('correct')}
                >
                  Correct ({questionCounts.correct})
                </button>
              </div>

              {/* Question Display */}
              {filteredQuestions.length === 0 ? (
                <div className="no-questions">
                  <p>No {questionFilter === 'all' ? '' : questionFilter} questions to display.</p>
                </div>
              ) : (
                <>
                  <div className="question-progress">
                    Question {currentQuestionIndex + 1} of {filteredQuestions.length}
                  </div>

                  <div className="question-card">
                    <div className="question-header">
                      <span className="question-number">Q{currentQuestion.questionNumber}</span>
                      {currentQuestion.timeSpent !== null && (
                        <span className="question-time">{currentQuestion.timeSpent}s</span>
                      )}
                    </div>

                    <div className="question-expression">
                      {currentQuestion.expression}
                    </div>

                    <div className="answers-comparison">
                      <div className={`answer-box ${
                        currentQuestion.isCorrect === null
                          ? 'unanswered'
                          : currentQuestion.isCorrect
                          ? 'correct'
                          : 'wrong'
                      }`}>
                        <span className="answer-label">Student's Answer</span>
                        <span className="answer-value">
                          {currentQuestion.userAnswer !== null ? currentQuestion.userAnswer : '-'}
                          <span className="answer-icon">
                            {currentQuestion.isCorrect === null && '-'}
                            {currentQuestion.isCorrect === true && '&#10003;'}
                            {currentQuestion.isCorrect === false && '&#10007;'}
                          </span>
                        </span>
                      </div>

                      <div className="answer-box correct">
                        <span className="answer-label">Correct Answer</span>
                        <span className="answer-value">
                          {currentQuestion.correctAnswer}
                          <span className="answer-icon">&#10003;</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="question-navigation">
                    <button
                      className="nav-btn"
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                      Previous
                    </button>

                    <div className="question-dots">
                      {filteredQuestions.slice(0, 20).map((_, idx) => (
                        <button
                          key={idx}
                          className={`dot ${idx === currentQuestionIndex ? 'active' : ''}`}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          title={`Question ${idx + 1}`}
                        />
                      ))}
                      {filteredQuestions.length > 20 && (
                        <span className="more-dots">+{filteredQuestions.length - 20}</span>
                      )}
                    </div>

                    <button
                      className="nav-btn"
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex === filteredQuestions.length - 1}
                    >
                      Next
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>

                  {/* Questions List View */}
                  <div className="questions-list">
                    <h3>All {questionFilter === 'all' ? '' : questionFilter} Questions</h3>
                    <div className="questions-grid">
                      {filteredQuestions.map((q, idx) => (
                        <div
                          key={q.questionNumber}
                          className={`question-item ${
                            q.isCorrect === null
                              ? 'unanswered'
                              : q.isCorrect
                              ? 'correct'
                              : 'wrong'
                          } ${idx === currentQuestionIndex ? 'selected' : ''}`}
                          onClick={() => setCurrentQuestionIndex(idx)}
                        >
                          <span className="q-num">Q{q.questionNumber}</span>
                          <span className="q-expr">{q.expression}</span>
                          <span className="q-answer">
                            {q.userAnswer !== null ? q.userAnswer : '-'}
                            {q.isCorrect === false && <span className="correct-hint">({q.correctAnswer})</span>}
                          </span>
                          <span className="q-status">
                            {q.isCorrect === null && '?'}
                            {q.isCorrect === true && '&#10003;'}
                            {q.isCorrect === false && '&#10007;'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Teacher Insights Tab */}
          {activeTab === 'insights' && (
            <div className="insights-tab">
              <h2>Teacher Insights</h2>

              {classStats ? (
                <div className="insights-content">
                  {/* Class Comparison */}
                  <div className="insight-card comparison">
                    <h3>Class Comparison</h3>
                    <div className="comparison-grid">
                      <div className="comparison-item">
                        <span className="comparison-label">This Student</span>
                        <span className={`comparison-value ${getScoreColor(session.score)}`}>
                          {Math.round(session.score)}%
                        </span>
                      </div>
                      <div className="comparison-item">
                        <span className="comparison-label">Class Average</span>
                        <span className="comparison-value">{Math.round(classStats.averageScore)}%</span>
                      </div>
                      <div className="comparison-item">
                        <span className="comparison-label">Difference</span>
                        <span className={`comparison-value ${session.score >= classStats.averageScore ? 'positive' : 'negative'}`}>
                          {session.score >= classStats.averageScore ? '+' : ''}{Math.round(session.score - classStats.averageScore)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rank */}
                  <div className="insight-card rank">
                    <h3>Class Rank</h3>
                    <div className="rank-display">
                      <span className="rank-number">{classStats.studentRank}</span>
                      <span className="rank-suffix">
                        {classStats.studentRank === 1 ? 'st' : classStats.studentRank === 2 ? 'nd' : classStats.studentRank === 3 ? 'rd' : 'th'}
                      </span>
                      <span className="rank-total">out of {classStats.totalStudents} students</span>
                    </div>
                  </div>

                  {/* Time Comparison */}
                  <div className="insight-card time">
                    <h3>Time Analysis</h3>
                    <div className="time-comparison">
                      <div className="time-item">
                        <span className="time-label">Student's Time</span>
                        <span className="time-value">{formatTime(session.timeTaken)}</span>
                      </div>
                      <div className="time-item">
                        <span className="time-label">Class Average</span>
                        <span className="time-value">{formatTime(classStats.averageTime)}</span>
                      </div>
                      <div className="time-item">
                        <span className="time-label">Difference</span>
                        <span className={`time-value ${session.timeTaken <= classStats.averageTime ? 'positive' : 'negative'}`}>
                          {session.timeTaken <= classStats.averageTime ? 'Faster by ' : 'Slower by '}
                          {formatTime(Math.abs(session.timeTaken - classStats.averageTime))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="insights-placeholder">
                  <div className="placeholder-icon">&#128202;</div>
                  <p>Class comparison data is being calculated.</p>
                  <p className="subtext">
                    Once more students complete this practice sheet, you'll see comparative insights here.
                  </p>
                </div>
              )}

              {/* Question Analysis */}
              <div className="insight-card question-analysis">
                <h3>Question Analysis</h3>
                <div className="analysis-stats">
                  <div className="analysis-item">
                    <span className="analysis-label">Accuracy Rate</span>
                    <span className={`analysis-value ${getScoreColor(session.attempted > 0 ? (session.correct / session.attempted) * 100 : 0)}`}>
                      {session.attempted > 0 ? Math.round((session.correct / session.attempted) * 100) : 0}%
                    </span>
                  </div>
                  <div className="analysis-item">
                    <span className="analysis-label">Completion Rate</span>
                    <span className="analysis-value">
                      {Math.round((session.attempted / session.total) * 100)}%
                    </span>
                  </div>
                  <div className="analysis-item">
                    <span className="analysis-label">Speed</span>
                    <span className="analysis-value">
                      {formatAvgTime(avgTimePerQuestion)} per question
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Pattern */}
              {session.intervals && session.intervals.length > 0 && (
                <div className="insight-card performance-pattern">
                  <h3>Performance Pattern</h3>
                  <div className="pattern-analysis">
                    {(() => {
                      const firstHalf = session.intervals.slice(0, Math.ceil(session.intervals.length / 2));
                      const secondHalf = session.intervals.slice(Math.ceil(session.intervals.length / 2));

                      const firstHalfAccuracy = firstHalf.reduce((sum, i) => sum + (i.questionsAttempted > 0 ? i.correct / i.questionsAttempted : 0), 0) / firstHalf.length * 100;
                      const secondHalfAccuracy = secondHalf.length > 0 ? secondHalf.reduce((sum, i) => sum + (i.questionsAttempted > 0 ? i.correct / i.questionsAttempted : 0), 0) / secondHalf.length * 100 : 0;

                      const trend = secondHalfAccuracy > firstHalfAccuracy + 5
                        ? 'improving'
                        : secondHalfAccuracy < firstHalfAccuracy - 5
                        ? 'declining'
                        : 'consistent';

                      return (
                        <>
                          <div className="pattern-item">
                            <span className="pattern-label">First Half Accuracy</span>
                            <span className="pattern-value">{Math.round(firstHalfAccuracy)}%</span>
                          </div>
                          <div className="pattern-item">
                            <span className="pattern-label">Second Half Accuracy</span>
                            <span className="pattern-value">{Math.round(secondHalfAccuracy)}%</span>
                          </div>
                          <div className={`pattern-trend ${trend}`}>
                            {trend === 'improving' && 'Performance improved as the test progressed &#128200;'}
                            {trend === 'declining' && 'Performance declined as the test progressed &#128201;'}
                            {trend === 'consistent' && 'Performance remained consistent throughout &#10004;'}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
