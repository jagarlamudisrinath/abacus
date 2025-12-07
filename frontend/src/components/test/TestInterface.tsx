import React, { useState, useCallback } from 'react';
import { useTest } from '../../contexts/TestContext';
import QuestionDisplay from './QuestionDisplay';
import ResponseInput from './ResponseInput';
import QuestionNavigation from './QuestionNavigation';
import Timer from './Timer';
import IntervalModal from './IntervalModal';
import './TestInterface.css';

interface TestInterfaceProps {
  onComplete: () => void;
}

export default function TestInterface({ onComplete }: TestInterfaceProps) {
  const {
    state,
    dispatch,
    currentQuestion,
    setResponse,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    toggleBookmark,
  } = useTest();

  const [showValidationError, setShowValidationError] = useState(false);
  const [showIntervalModal, setShowIntervalModal] = useState(false);
  const [currentIntervalNumber, setCurrentIntervalNumber] = useState(0);

  // Calculate current stats from responses
  const calculateStats = useCallback(() => {
    const responses = Object.values(state.responses);
    const attempted = responses.filter(r => r.userAnswer != null && r.userAnswer !== '').length;
    const correct = responses.filter(r => r.isCorrect === true).length;
    const incorrect = responses.filter(r => r.isCorrect === false).length;
    return { attempted, correct, incorrect };
  }, [state.responses]);

  // Handle 7-minute interval reached
  const handleIntervalReached = useCallback((intervalNumber: number) => {
    const stats = calculateStats();

    // Calculate current interval stats
    const currentAttempted = stats.attempted - state.questionsAtIntervalStart;
    const currentCorrect = stats.correct - state.correctAtIntervalStart;
    const currentIncorrect = stats.incorrect - state.incorrectAtIntervalStart;
    // Calculate actual interval duration from elapsed time
    const intervalDuration = state.elapsedTime - state.currentIntervalStart;
    const avgTime = currentAttempted > 0 ? intervalDuration / currentAttempted : 0;

    // Save interval stats
    dispatch({
      type: 'SAVE_INTERVAL',
      payload: {
        intervalNumber,
        startTime: state.currentIntervalStart,
        endTime: state.elapsedTime,
        questionsAttempted: currentAttempted,
        correct: currentCorrect,
        incorrect: currentIncorrect,
        avgTimePerQuestion: avgTime,
      }
    });

    // Pause and show modal
    dispatch({ type: 'PAUSE_TEST' });
    setCurrentIntervalNumber(intervalNumber);
    setShowIntervalModal(true);
  }, [calculateStats, state.questionsAtIntervalStart, state.correctAtIntervalStart, state.incorrectAtIntervalStart, state.currentIntervalStart, state.elapsedTime, dispatch]);

  // Handle resume from interval modal
  const handleResume = useCallback(() => {
    const stats = calculateStats();

    // Start new interval tracking
    dispatch({
      type: 'START_NEW_INTERVAL',
      payload: {
        attempted: stats.attempted,
        correct: stats.correct,
        incorrect: stats.incorrect,
      }
    });

    dispatch({ type: 'RESUME_TEST' });
    setShowIntervalModal(false);
  }, [calculateStats, dispatch]);

  const current = currentQuestion();

  if (!state.test || !current) {
    return (
      <div className="test-interface loading">
        <p>Loading test...</p>
      </div>
    );
  }

  const { question, section } = current;
  const response = state.responses[question.id];
  const isTestMode = state.test.mode === 'test';

  // Check if current question has an answer
  const hasAnswer = response?.userAnswer != null && response?.userAnswer !== '';

  // Check if can navigate
  const isLastQuestion =
    state.currentSectionIndex === state.test.sections.length - 1 &&
    state.currentQuestionIndex === section.questions.length - 1;

  const canGoNext = !isLastQuestion;
  const canGoPrev = !isTestMode && (state.currentQuestionIndex > 0 || state.currentSectionIndex > 0);

  const handleNext = () => {
    // Validate that an answer has been entered
    if (!hasAnswer) {
      setShowValidationError(true);
      return;
    }
    setShowValidationError(false);

    if (isLastQuestion) {
      onComplete();
    } else {
      nextQuestion();
    }
  };

  const handleSectionChange = (sectionIndex: number) => {
    if (!isTestMode) {
      goToQuestion(sectionIndex, 0);
    }
  };

  return (
    <div className="test-interface">
      {isTestMode && state.timeRemaining !== null ? (
        <Timer
          mode="countdown"
          time={state.timeRemaining}
          onTimeUp={onComplete}
        />
      ) : (
        <Timer
          mode="countup"
          time={state.elapsedTime}
          isPaused={state.isPaused}
          onIntervalReached={handleIntervalReached}
        />
      )}

      <QuestionNavigation
        sections={state.test.sections}
        currentSectionIndex={state.currentSectionIndex}
        currentQuestionIndex={state.currentQuestionIndex}
        responses={state.responses}
        onQuestionClick={goToQuestion}
        onSectionChange={handleSectionChange}
        isTestMode={isTestMode}
        onPrevQuestion={prevQuestion}
        onNextQuestion={handleNext}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext || isLastQuestion}
      />

      <div className="test-content">
        {/* Left side navigation arrow */}
        <button
          className="side-nav-arrow left"
          onClick={prevQuestion}
          disabled={!canGoPrev}
          title="Previous Question"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <QuestionDisplay
          question={question}
          section={section}
          onBookmarkToggle={() => toggleBookmark(question.id)}
          isTestMode={isTestMode}
        />

        <ResponseInput
          questionId={question.id}
          currentAnswer={response?.userAnswer || null}
          onAnswerChange={(answer) => {
            setResponse(question.id, answer);
            if (answer) setShowValidationError(false);
          }}
          onNext={handleNext}
          onPrev={prevQuestion}
          canGoNext={canGoNext || isLastQuestion}
          canGoPrev={canGoPrev}
          showValidationError={showValidationError}
        />

        {/* Right side navigation arrow */}
        <button
          className="side-nav-arrow right"
          onClick={handleNext}
          disabled={!canGoNext && !isLastQuestion}
          title="Next Question"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* 7-Minute Interval Modal */}
      {(() => {
        const stats = calculateStats();
        const currentAttempted = stats.attempted - state.questionsAtIntervalStart;
        const currentCorrect = stats.correct - state.correctAtIntervalStart;
        const currentIncorrect = stats.incorrect - state.incorrectAtIntervalStart;
        // Calculate actual interval duration from elapsed time
        const intervalDuration = state.elapsedTime - state.currentIntervalStart;
        const avgTime = currentAttempted > 0 ? intervalDuration / currentAttempted : 0;
        const totalAvgTime = stats.attempted > 0 ? state.elapsedTime / stats.attempted : 0;
        const totalQuestions = state.test.sections.reduce((sum, s) => sum + s.questions.length, 0);

        return (
          <IntervalModal
            isOpen={showIntervalModal}
            intervalNumber={currentIntervalNumber}
            currentStats={{
              attempted: currentAttempted,
              correct: currentCorrect,
              incorrect: currentIncorrect,
              avgTime: avgTime,
            }}
            totalStats={{
              attempted: stats.attempted,
              correct: stats.correct,
              incorrect: stats.incorrect,
              avgTime: totalAvgTime,
              totalQuestions: totalQuestions,
            }}
            previousIntervals={state.intervals}
            onResume={handleResume}
          />
        );
      })()}
    </div>
  );
}
