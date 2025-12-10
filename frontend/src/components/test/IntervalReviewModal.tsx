import React, { useState, useMemo } from 'react';
import { useTest } from '../../contexts/TestContext';
import { Question, IntervalStats } from '../../types';
import './IntervalReviewModal.css';

interface IntervalReviewModalProps {
  isOpen: boolean;
  intervalNumber: number;
  interval: IntervalStats | null;
  onClose: () => void;
}

interface WrongQuestion {
  question: Question;
  userAnswer: string;
  sectionName: string;
}

export default function IntervalReviewModal({
  isOpen,
  intervalNumber,
  interval,
  onClose,
}: IntervalReviewModalProps) {
  const { state } = useTest();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get wrong questions for this interval
  const wrongQuestions = useMemo<WrongQuestion[]>(() => {
    if (!interval || !interval.wrongQuestionIds || !state.test) {
      return [];
    }

    const questions: WrongQuestion[] = [];

    for (const section of state.test.sections) {
      for (const question of section.questions) {
        if (interval.wrongQuestionIds.includes(question.id)) {
          const response = state.responses[question.id];
          if (response && response.userAnswer !== null) {
            questions.push({
              question,
              userAnswer: response.userAnswer,
              sectionName: section.name,
            });
          }
        }
      }
    }

    return questions;
  }, [interval, state.test, state.responses]);

  if (!isOpen || !interval || wrongQuestions.length === 0) {
    return null;
  }

  const currentWrong = wrongQuestions[currentIndex];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < wrongQuestions.length - 1;

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="interval-review-overlay">
      <div className="interval-review-modal">
        <div className="interval-review-header">
          <div className="header-title">
            <span className="review-icon">📝</span>
            <h2>Interval {intervalNumber} - Wrong Answers</h2>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="review-progress">
          <span>{currentIndex + 1} of {wrongQuestions.length}</span>
          <div className="progress-dots">
            {wrongQuestions.map((_, idx) => (
              <button
                key={idx}
                className={`dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </div>

        <div className="review-content">
          <div className="section-label">{currentWrong.sectionName}</div>

          <div className="question-expression">
            {currentWrong.question.expression}
          </div>

          <div className="answer-comparison">
            <div className="answer-box wrong">
              <span className="answer-label">Your Answer</span>
              <span className="answer-value">{currentWrong.userAnswer}</span>
            </div>
            <div className="answer-box correct">
              <span className="answer-label">Correct Answer</span>
              <span className="answer-value">{currentWrong.question.correctAnswer}</span>
            </div>
          </div>
        </div>

        <div className="review-navigation">
          <button
            className="nav-btn prev"
            onClick={handlePrev}
            disabled={!canGoPrev}
          >
            ← Previous
          </button>
          <button
            className="nav-btn close"
            onClick={onClose}
          >
            Done
          </button>
          <button
            className="nav-btn next"
            onClick={handleNext}
            disabled={!canGoNext}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
