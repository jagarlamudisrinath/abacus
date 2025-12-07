import React, { useState, useEffect, useRef } from 'react';
import './ResponseInput.css';

interface ResponseInputProps {
  questionId: string;
  currentAnswer: string | null;
  onAnswerChange: (answer: string) => void;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  showValidationError?: boolean;
}

export default function ResponseInput({
  questionId,
  currentAnswer,
  onAnswerChange,
  onNext,
  onPrev,
  canGoNext,
  canGoPrev,
  showValidationError = false,
}: ResponseInputProps) {
  const [value, setValue] = useState(currentAnswer || '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Update value when question changes
  useEffect(() => {
    setValue(currentAnswer || '');
    // Don't auto-focus - user must manually click the input box
  }, [questionId, currentAnswer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Only allow numbers and negative sign
    if (/^-?\d*$/.test(newValue)) {
      setValue(newValue);
      onAnswerChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onNext();
    }
  };

  return (
    <div className="response-input-container">
      <div className="response-section">
        <label className="response-label">Enter your Response</label>
        <input
          ref={inputRef}
          type="text"
          className={`response-input ${showValidationError ? 'error' : ''}`}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer..."
          autoComplete="off"
        />
        {showValidationError && (
          <div className="validation-error">
            Please enter an answer before proceeding
          </div>
        )}
      </div>

    </div>
  );
}
