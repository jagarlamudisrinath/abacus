import React, { useRef, useEffect, useState } from 'react';
import { Section } from '../../types';
import './QuestionNavigation.css';

interface QuestionNavigationProps {
  sections: Section[];
  currentSectionIndex: number;
  currentQuestionIndex: number;
  responses: Record<string, { userAnswer: string | null }>;
  onQuestionClick: (sectionIndex: number, questionIndex: number) => void;
  onSectionChange: (sectionIndex: number) => void;
  isTestMode: boolean;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export default function QuestionNavigation({
  sections,
  currentSectionIndex,
  currentQuestionIndex,
  responses,
  onQuestionClick,
  onSectionChange,
  isTestMode,
  onPrevQuestion,
  onNextQuestion,
  canGoPrev,
  canGoNext,
}: QuestionNavigationProps) {
  const currentSection = sections[currentSectionIndex];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Calculate total progress
  const totalAttempted = Object.values(responses).filter(
    (r) => r.userAnswer !== null && r.userAnswer !== ''
  ).length;
  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);

  // Calculate section progress
  const getSectionProgress = (section: Section) => {
    const answered = section.questions.filter(
      (q) => {
        const response = responses[q.id];
        return response && response.userAnswer !== null && response.userAnswer !== '';
      }
    ).length;
    return Math.round((answered / section.questions.length) * 100);
  };

  // Scroll to current question
  useEffect(() => {
    const container = scrollContainerRef.current;
    const activeButton = container?.querySelector('.question-btn.active');
    if (activeButton && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      const scrollLeft = buttonRect.left - containerRect.left - containerRect.width / 2 + buttonRect.width / 2;
      container.scrollBy({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [currentQuestionIndex, currentSectionIndex]);

  const getQuestionStatus = (question: { id: string }) => {
    const response = responses[question.id];
    if (response?.userAnswer !== null && response?.userAnswer !== '') {
      return 'answered';
    }
    return 'unanswered';
  };

  const canClickQuestion = (sectionIndex: number, questionIndex: number) => {
    if (!isTestMode) return true;

    // In test mode, can only go forward in current section
    if (sectionIndex < currentSectionIndex) return false;
    if (sectionIndex > currentSectionIndex) return false;
    if (questionIndex < currentQuestionIndex) return false;

    return true;
  };

  return (
    <div className="question-navigation">
      <div className="nav-row">
        <div className="nav-left">
          <div className="section-dropdown-container">
            <button
              className="section-dropdown-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isTestMode}
            >
              <span className="section-number-text">{currentSectionIndex + 1}.</span>
              <span className="section-dropdown-text">{currentSection.name}</span>
              <svg className="section-blue-square" viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                <rect x="2" y="2" width="12" height="12" rx="2" />
              </svg>
              <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="section-dropdown-menu">
                {sections.map((section, index) => {
                  const progress = getSectionProgress(section);
                  const isActive = index === currentSectionIndex;
                  const isLocked = isTestMode && index < currentSectionIndex;

                  return (
                    <div
                      key={section.id}
                      className={`section-dropdown-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                      onClick={() => {
                        if (!isLocked && !isTestMode) {
                          onSectionChange(index);
                          setIsDropdownOpen(false);
                        }
                      }}
                    >
                      <div className="section-item-header">
                        {isLocked && (
                          <svg className="lock-icon" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        )}
                        {!isLocked && (
                          <span className="section-item-badge">{index + 1}</span>
                        )}
                        <span className="section-item-name">{section.name}</span>
                        <svg className="section-item-icon" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                        </svg>
                      </div>
                      <div className="section-item-progress">
                        <span className="progress-text">{progress}% Done</span>
                        <div className="progress-bar-mini">
                          <div className="progress-fill-mini" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button className="instructions-btn" title="Instructions">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        </div>

        <div className="nav-center">
          <button
            className="scroll-btn"
            onClick={() => {
              const container = scrollContainerRef.current;
              if (container) {
                container.scrollBy({ left: -150, behavior: 'smooth' });
              }
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="questions-scroll" ref={scrollContainerRef}>
            {currentSection.questions.map((question, index) => {
              const status = getQuestionStatus(question);
              const isActive = index === currentQuestionIndex;
              const canClick = canClickQuestion(currentSectionIndex, index);

              return (
                <button
                  key={question.id}
                  className={`question-btn ${status} ${isActive ? 'active' : ''}`}
                  onClick={() => canClick && onQuestionClick(currentSectionIndex, index)}
                  disabled={!canClick}
                  title={`Question ${question.questionNumber}`}
                >
                  {question.questionNumber}
                </button>
              );
            })}
          </div>

          <button
            className="scroll-btn"
            onClick={() => {
              const container = scrollContainerRef.current;
              if (container) {
                container.scrollBy({ left: 150, behavior: 'smooth' });
              }
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button className="grid-btn" title="View all questions">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
        </div>

        <div className="nav-right">
          <span className="attempted-text">
            Attempted: {totalAttempted}/{totalQuestions}
          </span>

          <button
            className="nav-prev-next-btn"
            onClick={onPrevQuestion}
            disabled={!canGoPrev}
          >
            Previous
          </button>
          <button
            className="nav-prev-next-btn"
            onClick={onNextQuestion}
            disabled={!canGoNext}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
