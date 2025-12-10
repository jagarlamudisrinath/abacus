import React, { useState, useCallback } from 'react';
import { SettingsProvider } from './contexts/SettingsContext';
import { TestProvider, useTest } from './contexts/TestContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import WelcomeScreen from './components/welcome/WelcomeScreen';
import TestInterface from './components/test/TestInterface';
import ResultsScreen from './components/results/ResultsScreen';
import ReviewScreen from './components/review/ReviewScreen';
import LoginScreen from './components/auth/LoginScreen';
import ChangePasswordScreen from './components/auth/ChangePasswordScreen';
import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import SuperuserDashboard from './components/admin/SuperuserDashboard';
import { TestMode, TestResult } from './types';
import { generateTest, submitTest, saveProgress } from './services/api';
import './styles/globals.css';

type AppScreen = 'login' | 'welcome' | 'test' | 'results' | 'review' | 'dashboard' | 'admin' | 'change-password';
type ReviewFilter = 'wrong' | 'unanswered';

function AppContent() {
  const [screen, setScreen] = useState<AppScreen>('login');
  const [result, setResult] = useState<TestResult | null>(null);
  const [lastMode, setLastMode] = useState<TestMode>('practice');
  const [lastPracticeSheetId, setLastPracticeSheetId] = useState('aa-2');
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('wrong');
  const { state, dispatch } = useTest();
  const { isAuthenticated, isTeacher, isSuperuser, isLoading, logout, student } = useAuth();

  const handleStartTest = useCallback(
    async (mode: TestMode, practiceSheetId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        setLastMode(mode);
        setLastPracticeSheetId(practiceSheetId);

        const test = await generateTest(mode, practiceSheetId, 'User');
        dispatch({ type: 'SET_TEST', payload: test });
        setScreen('test');
      } catch (error) {
        console.error('Failed to start test:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to start test. Please try again.' });
      }
    },
    [dispatch]
  );

  const handleCompleteTest = useCallback(async () => {
    if (!state.test) return;

    try {
      // Use elapsedTime which is the actual test duration tracked by the timer
      const timeTaken = state.elapsedTime;

      // Calculate intervals BEFORE submitting so we can send them to backend
      const localResult = calculateLocalResults();

      // Pass intervals to submitTest so they're stored in the database
      const testResult = await submitTest(state.test.id, state.responses, timeTaken, localResult.intervals);

      // Merge with local intervals (use local as source of truth for display)
      setResult({ ...testResult, intervals: localResult.intervals });
      setScreen('results');
    } catch (error) {
      console.error('Failed to submit test:', error);
      // Calculate results locally as fallback
      const localResult = calculateLocalResults();
      setResult(localResult);
      setScreen('results');
    }
  }, [state.test, state.responses, state.intervals, state.elapsedTime, state.questionsAtIntervalStart, state.correctAtIntervalStart, state.incorrectAtIntervalStart, state.currentIntervalStart]);

  const calculateLocalResults = (): TestResult => {
    if (!state.test) {
      return {
        testId: '',
        totalQuestions: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        unanswered: 0,
        score: 0,
        timeTaken: 0,
        sectionResults: [],
        completedAt: new Date(),
        intervals: [],
      };
    }

    let correct = 0;
    let attempted = 0;

    const sectionResults = state.test.sections.map((section) => {
      let sectionCorrect = 0;
      let sectionAttempted = 0;

      section.questions.forEach((question) => {
        const response = state.responses[question.id];
        if (response && response.userAnswer !== null && response.userAnswer !== '') {
          sectionAttempted++;
          attempted++;
          if (parseInt(response.userAnswer) === question.correctAnswer) {
            sectionCorrect++;
            correct++;
          }
        }
      });

      return {
        sectionId: section.id,
        sectionName: section.name,
        sectionType: section.type,
        total: section.questions.length,
        attempted: sectionAttempted,
        correct: sectionCorrect,
        accuracy: sectionAttempted > 0 ? (sectionCorrect / sectionAttempted) * 100 : 0,
      };
    });

    // Use elapsedTime which is the actual test duration tracked by the timer
    const timeTaken = state.elapsedTime;

    // Include any final interval that may not have been saved (time remaining after last 7-min checkpoint)
    const allIntervals = [...state.intervals];

    // Add final incomplete interval if there was time after the last checkpoint
    const lastIntervalEnd = state.intervals.length > 0
      ? state.intervals[state.intervals.length - 1].endTime
      : 0;

    if (state.elapsedTime > lastIntervalEnd) {
      const finalAttempted = attempted - state.questionsAtIntervalStart;
      const finalCorrect = correct - state.correctAtIntervalStart;
      const finalIncorrect = (attempted - correct) - state.incorrectAtIntervalStart;
      const finalDuration = state.elapsedTime - state.currentIntervalStart;

      if (finalAttempted > 0) {
        allIntervals.push({
          intervalNumber: state.intervals.length + 1,
          startTime: state.currentIntervalStart,
          endTime: state.elapsedTime,
          questionsAttempted: finalAttempted,
          correct: finalCorrect,
          incorrect: finalIncorrect,
          avgTimePerQuestion: finalDuration / finalAttempted,
        });
      }
    }

    return {
      testId: state.test.id,
      totalQuestions: state.test.totalQuestions,
      attempted,
      correct,
      incorrect: attempted - correct,
      unanswered: state.test.totalQuestions - attempted,
      score: state.test.totalQuestions > 0 ? (correct / state.test.totalQuestions) * 100 : 0,
      timeTaken,
      sectionResults,
      completedAt: new Date(),
      intervals: allIntervals,
    };
  };

  const handleSave = useCallback(async () => {
    if (!state.test) return;

    try {
      await saveProgress(
        state.test.id,
        state.responses,
        state.currentSectionIndex,
        state.currentQuestionIndex
      );
      dispatch({ type: 'SET_SAVED', payload: new Date() });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [state.test, state.responses, state.currentSectionIndex, state.currentQuestionIndex, dispatch]);

  const handleSaveAndClose = useCallback(async () => {
    if (!state.test) {
      setScreen('welcome');
      return;
    }

    try {
      // Use elapsedTime which is the actual test duration tracked by the timer
      const timeTaken = state.elapsedTime;

      // Calculate and send intervals when saving and closing
      const localResult = calculateLocalResults();

      // Submit the test to properly complete the session and save all data including timeSpent and intervals
      await submitTest(state.test.id, state.responses, timeTaken, localResult.intervals);
    } catch (error) {
      console.error('Failed to submit test on close:', error);
    }

    setScreen('welcome');
  }, [state.test, state.responses, state.intervals, state.elapsedTime, state.questionsAtIntervalStart, state.correctAtIntervalStart, state.incorrectAtIntervalStart, state.currentIntervalStart]);

  const handleRetry = useCallback(() => {
    handleStartTest(lastMode, lastPracticeSheetId);
  }, [handleStartTest, lastMode, lastPracticeSheetId]);

  const handleHome = useCallback(() => {
    setScreen('welcome');
    setResult(null);
  }, []);

  const handleReview = useCallback((filter: ReviewFilter) => {
    setReviewFilter(filter);
    setScreen('review');
  }, []);

  const handleBackToResults = useCallback(() => {
    setScreen('results');
  }, []);

  const handleLoginSuccess = useCallback(() => {
    // If user needs to change password, redirect to change-password screen
    if (student?.mustChangePassword) {
      setScreen('change-password');
    } else {
      setScreen('welcome');
    }
  }, [student?.mustChangePassword]);

  const handlePasswordChanged = useCallback(() => {
    setScreen('welcome');
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setScreen('login');
  }, [logout]);

  const handleShowDashboard = useCallback(() => {
    setScreen('dashboard');
  }, []);

  const handleDashboardBack = useCallback(() => {
    setScreen('welcome');
  }, []);

  const handleShowAdmin = useCallback(() => {
    setScreen('admin');
  }, []);

  const handleAdminBack = useCallback(() => {
    logout();
    setScreen('login');
  }, [logout]);

  // Admin screen handling - only accessible to teachers and superusers
  if (screen === 'admin') {
    // Redirect to login if not authenticated as teacher or superuser
    if (!isTeacher && !isSuperuser) {
      setScreen('login');
      return null;
    }
    // Superuser sees SuperuserDashboard
    if (isSuperuser) {
      return <SuperuserDashboard onLogout={handleAdminBack} />;
    }
    // Regular teacher sees AdminDashboard
    return <AdminDashboard onBack={handleAdminBack} onStartPractice={() => setScreen('welcome')} />;
  }

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated && screen !== 'login') {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (screen === 'login') {
    if (isAuthenticated) {
      // Already logged in - check if password change required
      if (student?.mustChangePassword) {
        setScreen('change-password');
      } else {
        setScreen('welcome');
      }
      return null;
    }
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Force password change screen - must be shown before any other screen
  if (screen === 'change-password' || (isAuthenticated && student?.mustChangePassword)) {
    return <ChangePasswordScreen onPasswordChanged={handlePasswordChanged} />;
  }

  if (screen === 'dashboard') {
    return (
      <Dashboard
        onStartPractice={() => setScreen('welcome')}
        onBack={handleDashboardBack}
      />
    );
  }

  if (screen === 'welcome') {
    return (
      <WelcomeScreen
        onStartTest={handleStartTest}
        onShowDashboard={handleShowDashboard}
        onLogout={handleLogout}
        onManageSheets={(isTeacher || isSuperuser) ? handleShowAdmin : undefined}
      />
    );
  }

  if (screen === 'review') {
    return <ReviewScreen filter={reviewFilter} onBack={handleBackToResults} />;
  }

  if (screen === 'results' && result) {
    return <ResultsScreen result={result} onRetry={handleRetry} onHome={handleHome} onReview={handleReview} />;
  }

  return (
    <MainLayout onSave={handleSave} onSaveAndClose={handleSaveAndClose}>
      <TestInterface onComplete={handleCompleteTest} />
    </MainLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <TestProvider>
          <AppContent />
        </TestProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
