import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { Test, TestState, TestAction, Response } from '../types';

const initialState: TestState = {
  test: null,
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  responses: {},
  startTime: null,
  timeRemaining: null,
  elapsedTime: 0,
  lastSavedAt: null,
  isLoading: false,
  error: null,
  // Interval tracking
  isPaused: false,
  intervals: [],
  currentIntervalStart: 0,
  questionsAtIntervalStart: 0,
  correctAtIntervalStart: 0,
  incorrectAtIntervalStart: 0,
};

function testReducer(state: TestState, action: TestAction): TestState {
  switch (action.type) {
    case 'SET_TEST':
      return {
        ...state,
        test: action.payload,
        startTime: new Date(),
        timeRemaining: action.payload.timeLimit,
        elapsedTime: 0,
        isLoading: false,
        error: null,
        // Reset interval tracking
        isPaused: false,
        intervals: [],
        currentIntervalStart: 0,
        questionsAtIntervalStart: 0,
        correctAtIntervalStart: 0,
        incorrectAtIntervalStart: 0,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'NEXT_QUESTION': {
      if (!state.test) return state;

      const currentSection = state.test.sections[state.currentSectionIndex];
      const isLastQuestionInSection = state.currentQuestionIndex >= currentSection.questions.length - 1;
      const isLastSection = state.currentSectionIndex >= state.test.sections.length - 1;

      if (isLastQuestionInSection) {
        if (isLastSection) {
          return state; // Can't go further
        }
        // Move to next section
        return {
          ...state,
          currentSectionIndex: state.currentSectionIndex + 1,
          currentQuestionIndex: 0,
        };
      }

      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
      };
    }

    case 'PREV_QUESTION': {
      if (!state.test) return state;

      // In test mode, don't allow going back
      if (state.test.mode === 'test') return state;

      if (state.currentQuestionIndex > 0) {
        return {
          ...state,
          currentQuestionIndex: state.currentQuestionIndex - 1,
        };
      }

      if (state.currentSectionIndex > 0) {
        const prevSection = state.test.sections[state.currentSectionIndex - 1];
        return {
          ...state,
          currentSectionIndex: state.currentSectionIndex - 1,
          currentQuestionIndex: prevSection.questions.length - 1,
        };
      }

      return state;
    }

    case 'GO_TO_QUESTION': {
      if (!state.test) return state;

      const { sectionIndex, questionIndex } = action.payload;

      // In test mode, can only go forward in current section
      if (state.test.mode === 'test') {
        if (sectionIndex < state.currentSectionIndex) return state;
        if (sectionIndex === state.currentSectionIndex && questionIndex < state.currentQuestionIndex) {
          return state;
        }
      }

      // Check if section is locked
      if (state.test.sections[sectionIndex]?.isLocked) return state;

      return {
        ...state,
        currentSectionIndex: sectionIndex,
        currentQuestionIndex: questionIndex,
      };
    }

    case 'SET_RESPONSE': {
      const { questionId, answer } = action.payload;

      // Find the question to check correctness
      let isCorrect: boolean | null = null;
      if (state.test && answer !== null && answer !== '') {
        for (const section of state.test.sections) {
          const question = section.questions.find(q => q.id === questionId);
          if (question) {
            isCorrect = parseInt(answer) === question.correctAnswer;
            break;
          }
        }
      }

      return {
        ...state,
        responses: {
          ...state.responses,
          [questionId]: {
            questionId,
            userAnswer: answer,
            isCorrect,
            answeredAt: new Date(),
          },
        },
      };
    }

    case 'TOGGLE_BOOKMARK': {
      if (!state.test) return state;

      const questionId = action.payload;
      const updatedSections = state.test.sections.map((section) => ({
        ...section,
        questions: section.questions.map((q) =>
          q.id === questionId ? { ...q, isBookmarked: !q.isBookmarked } : q
        ),
      }));

      return {
        ...state,
        test: { ...state.test, sections: updatedSections },
      };
    }

    case 'UPDATE_TIME':
      return { ...state, timeRemaining: action.payload };

    case 'UPDATE_ELAPSED_TIME':
      return { ...state, elapsedTime: state.elapsedTime + 1 };

    case 'SET_SAVED':
      return { ...state, lastSavedAt: action.payload };

    case 'COMPLETE_SECTION': {
      if (!state.test) return state;

      const sectionIndex = action.payload;
      const updatedSections = state.test.sections.map((section, idx) =>
        idx === sectionIndex
          ? { ...section, isCompleted: true, isLocked: state.test!.mode === 'test', progress: 100 }
          : section
      );

      return {
        ...state,
        test: { ...state.test, sections: updatedSections },
      };
    }

    case 'LOAD_SAVED_STATE':
      return { ...state, ...action.payload };

    case 'PAUSE_TEST':
      return { ...state, isPaused: true };

    case 'RESUME_TEST':
      return { ...state, isPaused: false };

    case 'SAVE_INTERVAL':
      return {
        ...state,
        intervals: [...state.intervals, action.payload],
      };

    case 'START_NEW_INTERVAL':
      return {
        ...state,
        currentIntervalStart: state.elapsedTime,
        questionsAtIntervalStart: action.payload.attempted,
        correctAtIntervalStart: action.payload.correct,
        incorrectAtIntervalStart: action.payload.incorrect,
      };

    default:
      return state;
  }
}

interface TestContextType {
  state: TestState;
  dispatch: React.Dispatch<TestAction>;
  currentQuestion: () => { question: any; section: any } | null;
  setResponse: (questionId: string, answer: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (sectionIndex: number, questionIndex: number) => void;
  toggleBookmark: (questionId: string) => void;
  getProgress: () => { attempted: number; total: number };
  getSectionProgress: (sectionIndex: number) => number;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export function TestProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(testReducer, initialState);

  const currentQuestion = useCallback(() => {
    if (!state.test) return null;

    const section = state.test.sections[state.currentSectionIndex];
    if (!section) return null;

    const question = section.questions[state.currentQuestionIndex];
    if (!question) return null;

    return { question, section };
  }, [state.test, state.currentSectionIndex, state.currentQuestionIndex]);

  const setResponse = useCallback((questionId: string, answer: string) => {
    dispatch({ type: 'SET_RESPONSE', payload: { questionId, answer } });
  }, []);

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

  const prevQuestion = useCallback(() => {
    dispatch({ type: 'PREV_QUESTION' });
  }, []);

  const goToQuestion = useCallback((sectionIndex: number, questionIndex: number) => {
    dispatch({ type: 'GO_TO_QUESTION', payload: { sectionIndex, questionIndex } });
  }, []);

  const toggleBookmark = useCallback((questionId: string) => {
    dispatch({ type: 'TOGGLE_BOOKMARK', payload: questionId });
  }, []);

  const getProgress = useCallback(() => {
    if (!state.test) return { attempted: 0, total: 0 };

    const total = state.test.totalQuestions;
    const attempted = Object.values(state.responses).filter(
      (r) => r.userAnswer !== null && r.userAnswer !== ''
    ).length;

    return { attempted, total };
  }, [state.test, state.responses]);

  const getSectionProgress = useCallback(
    (sectionIndex: number) => {
      if (!state.test) return 0;

      const section = state.test.sections[sectionIndex];
      if (!section) return 0;

      const answered = section.questions.filter(
        (q) => state.responses[q.id]?.userAnswer !== null && state.responses[q.id]?.userAnswer !== ''
      ).length;

      return (answered / section.questions.length) * 100;
    },
    [state.test, state.responses]
  );

  // Auto-save effect
  useEffect(() => {
    if (!state.test) return;

    const saveTimer = setInterval(() => {
      const saveData = {
        testId: state.test!.id,
        responses: state.responses,
        currentSectionIndex: state.currentSectionIndex,
        currentQuestionIndex: state.currentQuestionIndex,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(`test_${state.test!.id}`, JSON.stringify(saveData));
      dispatch({ type: 'SET_SAVED', payload: new Date() });
    }, 5000);

    return () => clearInterval(saveTimer);
  }, [state.test, state.responses, state.currentSectionIndex, state.currentQuestionIndex]);

  return (
    <TestContext.Provider
      value={{
        state,
        dispatch,
        currentQuestion,
        setResponse,
        nextQuestion,
        prevQuestion,
        goToQuestion,
        toggleBookmark,
        getProgress,
        getSectionProgress,
      }}
    >
      {children}
    </TestContext.Provider>
  );
}

export function useTest() {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
}
