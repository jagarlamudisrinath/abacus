import React, { useState, useMemo } from 'react';
import { useTest } from '../../contexts/TestContext';
import { Question, Section, Response } from '../../types';
import './ReviewScreen.css';

type ReviewFilter = 'wrong' | 'unanswered';

interface ReviewScreenProps {
  filter: ReviewFilter;
  onBack: () => void;
}

interface FilteredQuestion {
  question: Question;
  section: Section;
  response: Response | undefined;
  sectionIndex: number;
  questionIndex: number;
}

function getFilteredQuestions(
  sections: Section[],
  responses: Record<string, Response>,
  filter: ReviewFilter
): FilteredQuestion[] {
  const result: FilteredQuestion[] = [];

  sections.forEach((section, sectionIndex) => {
    section.questions.forEach((question, questionIndex) => {
      const response = responses[question.id];

      if (filter === 'wrong' && response?.isCorrect === false) {
        result.push({ question, section, response, sectionIndex, questionIndex });
      }

      if (filter === 'unanswered' && (!response || response.userAnswer === null || response.userAnswer === '')) {
        result.push({ question, section, response, sectionIndex, questionIndex });
      }
    });
  });

  return result;
}

export default function ReviewScreen({ filter, onBack }: ReviewScreenProps) {
  const { state } = useTest();
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredQuestions = useMemo(() => {
    if (!state.test) return [];
    return getFilteredQuestions(state.test.sections, state.responses, filter);
  }, [state.test, state.responses, filter]);

  if (!state.test || filteredQuestions.length === 0) {
    return (
      <div className="review-screen">
        <div className="review-empty">
          <h2>No {filter === 'wrong' ? 'Wrong' : 'Unanswered'} Questions</h2>
          <p>Great job! There are no questions to review.</p>
          <button className="back-btn" onClick={onBack}>
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  const currentItem = filteredQuestions[currentIndex];
  const { question, section, response } = currentItem;

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Escape') {
      onBack();
    }
  };

  return (
    <div className="review-screen" onKeyDown={handleKeyDown} tabIndex={0}>
      <header className="review-header">
        <div className="review-title">
          <h1>Review {filter === 'wrong' ? 'Wrong' : 'Unanswered'} Questions</h1>
          <span className="review-progress">
            Question {currentIndex + 1} of {filteredQuestions.length}
          </span>
        </div>
        <button className="back-btn" onClick={onBack}>
          Back to Results
        </button>
      </header>

      <div className="review-content">
        <div className="review-question-card">
          <div className="question-info">
            <span className="section-name">{section.name}</span>
            <span className="question-number">Question {question.questionNumber}</span>
          </div>

          <div className="expression">{question.expression}</div>

          <div className="answers-comparison">
            <div className={`answer-box ${filter === 'wrong' ? 'wrong' : 'unanswered'}`}>
              <span className="answer-label">Your Answer</span>
              <span className="answer-value">
                {response?.userAnswer || '—'}
                {filter === 'wrong' && <span className="icon wrong-icon">✗</span>}
                {filter === 'unanswered' && <span className="icon skip-icon">—</span>}
              </span>
            </div>

            <div className="answer-box correct">
              <span className="answer-label">Correct Answer</span>
              <span className="answer-value">
                {question.correctAnswer}
                <span className="icon correct-icon">✓</span>
              </span>
            </div>
          </div>
        </div>

        <div className="review-navigation">
          <button
            className="nav-btn prev"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Previous
          </button>

          <div className="question-dots">
            {filteredQuestions.map((_, idx) => (
              <button
                key={idx}
                className={`dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                title={`Question ${idx + 1}`}
              />
            ))}
          </div>

          <button
            className="nav-btn next"
            onClick={handleNext}
            disabled={currentIndex === filteredQuestions.length - 1}
          >
            Next
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
