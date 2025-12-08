import React, { useMemo } from 'react';
import { ProgressStats } from '../../services/progress.api';
import './AchievementBadges.css';

interface AchievementBadgesProps {
  stats: ProgressStats;
  streakDays: number;
}

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  condition: (stats: ProgressStats, streak: number) => boolean;
}

// SVG Icon Components for kid-friendly badges
const getBadgeIcon = (badgeId: string): React.ReactNode => {
  switch (badgeId) {
    // Session Milestones
    case 'first_session':
      // Footprint icon
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="badge-svg">
          <path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 9 9.5 11 12 11C14.5 11 16.5 9 16.5 6.5C16.5 4 14.5 2 12 2Z"/>
          <path d="M12 13C8 13 5 16 5 20V22H19V20C19 16 16 13 12 13Z"/>
        </svg>
      );
    case 'sessions_10':
      // Star icon
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="badge-svg">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
        </svg>
      );
    case 'sessions_50':
      // Medal icon
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="badge-svg">
          <path d="M12 4L9 1H15L12 4Z"/>
          <path d="M10 2V6H14V2"/>
          <circle cx="12" cy="14" r="7"/>
          <path d="M12 10L13.5 13H16.5L14 15L15 18L12 16L9 18L10 15L7.5 13H10.5L12 10Z" fill="white" opacity="0.9"/>
        </svg>
      );
    case 'sessions_100':
      // Trophy icon
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="badge-svg">
          <path d="M19 5H17V3H7V5H5C3.9 5 3 5.9 3 7V8C3 10.55 4.92 12.63 7.39 12.94C8.02 14.44 9.37 15.57 11 15.9V19H8V21H16V19H13V15.9C14.63 15.57 15.98 14.44 16.61 12.94C19.08 12.63 21 10.55 21 8V7C21 5.9 20.1 5 19 5ZM5 8V7H7V10.82C5.84 10.4 5 9.3 5 8ZM19 8C19 9.3 18.16 10.4 17 10.82V7H19V8Z"/>
        </svg>
      );

    // Accuracy Milestones
    case 'accuracy_80':
      // Target with 1 ring filled
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="badge-svg">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      );
    case 'accuracy_90':
      // Target with 2 rings filled
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="badge-svg">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2" fill="white"/>
        </svg>
      );
    case 'accuracy_95':
      // Bullseye - all filled
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="badge-svg">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6" fill="white"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      );

    // Streak Milestones
    case 'streak_3':
      // Small flame
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="badge-svg">
          <path d="M12 2C12 2 7 8 7 13C7 16.31 9.69 19 13 19C13 19 11 17 11 14C11 11 14 8 14 8C14 8 15 11 15 13C15 15.21 13.21 17 11 17C11 17 13 19 16 19C18.76 19 21 16.76 21 14C21 9 12 2 12 2Z"/>
        </svg>
      );
    case 'streak_7':
      // Medium flame with more detail
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="badge-svg">
          <path d="M12 2C12 2 6 9 6 14C6 17.87 9.13 21 13 21C13 21 10 18 10 15C10 12 13 9 13 9C13 9 15 12 15 14C15 16.76 12.76 19 10 19C10 19 14 21 17 21C19.76 21 22 18.76 22 16C22 10 12 2 12 2Z"/>
          <path d="M8 14C8 11 10 8 10 8C10 8 6 12 6 14C6 15.1 6.9 16 8 16C8 16 8 15 8 14Z" opacity="0.7"/>
        </svg>
      );
    case 'streak_30':
      // Large flame with sparkles
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="badge-svg">
          <path d="M12 1C12 1 5 9 5 14C5 18.42 8.58 22 13 22C13 22 9 19 9 15C9 11 13 7 13 7C13 7 16 11 16 14C16 17.31 13.31 20 10 20C10 20 15 22 18 22C21.31 22 24 19.31 24 16C24 9 12 1 12 1Z"/>
          <circle cx="3" cy="5" r="1"/>
          <circle cx="6" cy="3" r="1.5"/>
          <circle cx="20" cy="6" r="1"/>
          <circle cx="22" cy="4" r="0.8"/>
        </svg>
      );

    // Question Milestones
    case 'questions_100':
      // Pencil icon
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="badge-svg">
          <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"/>
        </svg>
      );
    case 'questions_500':
      // Lightbulb icon
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="badge-svg">
          <path d="M9 21C9 21.55 9.45 22 10 22H14C14.55 22 15 21.55 15 21V20H9V21ZM12 2C8.14 2 5 5.14 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.14 15.86 2 12 2ZM14.85 13.1L14 13.7V16H10V13.7L9.15 13.1C7.8 12.16 7 10.63 7 9C7 6.24 9.24 4 12 4C14.76 4 17 6.24 17 9C17 10.63 16.2 12.16 14.85 13.1Z"/>
        </svg>
      );
    case 'questions_1000':
      // Brain/thinking icon
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="badge-svg">
          <path d="M12 2C8.5 2 5.5 4.5 5 8C3.3 8.4 2 9.9 2 11.7C2 13.8 3.7 15.5 5.8 15.5H6V16C6 18.2 7.8 20 10 20H11V22H13V20H14C16.2 20 18 18.2 18 16V15.5H18.2C20.3 15.5 22 13.8 22 11.7C22 9.9 20.7 8.4 19 8C18.5 4.5 15.5 2 12 2ZM12 4C14.4 4 16.4 5.6 16.9 7.8C17.1 7.8 17.3 7.8 17.5 7.8C17.5 7.8 17.6 7.8 17.7 7.8C19 8.1 20 9.3 20 10.7C20 12.3 18.8 13.5 17.2 13.5H16V14C16 15.1 15.1 16 14 16H10C8.9 16 8 15.1 8 14V13.5H6.8C5.2 13.5 4 12.3 4 10.7C4 9.3 5 8.1 6.3 7.8C6.4 7.8 6.5 7.8 6.5 7.8C6.7 7.8 6.9 7.8 7.1 7.8C7.6 5.6 9.6 4 12 4Z"/>
          <circle cx="9" cy="10" r="1.5"/>
          <circle cx="15" cy="10" r="1.5"/>
        </svg>
      );

    // Score Milestones
    case 'high_scorer':
      // Star with sparkle
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="badge-svg">
          <path d="M12 4L13.5 9H18.5L14.5 12L16 17L12 14L8 17L9.5 12L5.5 9H10.5L12 4Z"/>
          <circle cx="19" cy="5" r="1.5"/>
          <circle cx="5" cy="6" r="1"/>
          <circle cx="20" cy="10" r="0.8"/>
        </svg>
      );
    case 'perfect_score':
      // Crown icon
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="badge-svg">
          <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.55 18.55 20 18 20H6C5.45 20 5 19.55 5 19V18H19V19Z"/>
        </svg>
      );

    default:
      // Default star icon as fallback
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="badge-svg">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
        </svg>
      );
  }
};

const BADGES: BadgeDefinition[] = [
  // Session milestones
  {
    id: 'first_session',
    name: 'First Steps',
    description: 'Complete your first practice session',
    condition: (stats) => stats.totalSessions >= 1,
  },
  {
    id: 'sessions_10',
    name: 'Getting Started',
    description: 'Complete 10 practice sessions',
    condition: (stats) => stats.totalSessions >= 10,
  },
  {
    id: 'sessions_50',
    name: 'Dedicated Learner',
    description: 'Complete 50 practice sessions',
    condition: (stats) => stats.totalSessions >= 50,
  },
  {
    id: 'sessions_100',
    name: 'Century Club',
    description: 'Complete 100 practice sessions',
    condition: (stats) => stats.totalSessions >= 100,
  },

  // Accuracy milestones
  {
    id: 'accuracy_80',
    name: 'Sharp Mind',
    description: 'Achieve 80% overall accuracy',
    condition: (stats) => stats.overallAccuracy >= 80,
  },
  {
    id: 'accuracy_90',
    name: 'Precision Master',
    description: 'Achieve 90% overall accuracy',
    condition: (stats) => stats.overallAccuracy >= 90,
  },
  {
    id: 'accuracy_95',
    name: 'Near Perfect',
    description: 'Achieve 95% overall accuracy',
    condition: (stats) => stats.overallAccuracy >= 95,
  },

  // Streak milestones
  {
    id: 'streak_3',
    name: 'On a Roll',
    description: 'Practice 3 days in a row',
    condition: (_, streak) => streak >= 3,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Practice 7 days in a row',
    condition: (_, streak) => streak >= 7,
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Practice 30 days in a row',
    condition: (_, streak) => streak >= 30,
  },

  // Question milestones
  {
    id: 'questions_100',
    name: 'Question Crusher',
    description: 'Answer 100 questions',
    condition: (stats) => stats.totalQuestionsAttempted >= 100,
  },
  {
    id: 'questions_500',
    name: 'Quiz Whiz',
    description: 'Answer 500 questions',
    condition: (stats) => stats.totalQuestionsAttempted >= 500,
  },
  {
    id: 'questions_1000',
    name: 'Math Machine',
    description: 'Answer 1000 questions',
    condition: (stats) => stats.totalQuestionsAttempted >= 1000,
  },

  // Score milestones
  {
    id: 'high_scorer',
    name: 'High Scorer',
    description: 'Score 90% or above in a session',
    condition: (stats) => stats.bestScore >= 90,
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Score 100% in a session',
    condition: (stats) => stats.bestScore >= 100,
  },
];

export default function AchievementBadges({ stats, streakDays }: AchievementBadgesProps) {
  const badges = useMemo(() => {
    return BADGES.map((badge) => ({
      ...badge,
      unlocked: badge.condition(stats, streakDays),
    }));
  }, [stats, streakDays]);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="achievement-badges">
      <div className="badges-header">
        <h2>Achievements</h2>
        <span className="badges-count">
          {unlockedCount}/{badges.length} unlocked
        </span>
      </div>
      <div className="badges-container">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`badge ${badge.unlocked ? 'unlocked' : 'locked'}`}
            title={`${badge.name}: ${badge.description}`}
          >
            <div className="badge-icon">
              {badge.unlocked ? (
                getBadgeIcon(badge.id)
              ) : (
                <span className="badge-lock">?</span>
              )}
            </div>
            <div className="badge-info">
              <span className="badge-name">{badge.name}</span>
              <span className="badge-description">{badge.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
