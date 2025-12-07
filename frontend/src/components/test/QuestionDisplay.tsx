import React from 'react';
import { Question, Section } from '../../types';
import './QuestionDisplay.css';

interface QuestionDisplayProps {
  question: Question;
  section: Section;
  onBookmarkToggle: () => void;
  isTestMode: boolean;
}

export default function QuestionDisplay({
  question,
  section,
  onBookmarkToggle,
  isTestMode,
}: QuestionDisplayProps) {
  return (
    <div className="question-display">
      <div className="question-header">
        <h1 className="question-number">Question {question.questionNumber}</h1>
        <button
          className={`bookmark-btn ${question.isBookmarked ? 'bookmarked' : ''}`}
          onClick={onBookmarkToggle}
          disabled={isTestMode}
          title={isTestMode ? 'Bookmarking disabled in test mode' : 'Revisit Later'}
        >
          <svg className="bookmark-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span>Revisit Later</span>
        </button>
      </div>

      <div className="question-expression">
        {question.expression}
      </div>
    </div>
  );
}
