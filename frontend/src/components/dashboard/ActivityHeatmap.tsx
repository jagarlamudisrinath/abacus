import React, { useMemo } from 'react';
import './ActivityHeatmap.css';

interface ActivityDay {
  date: string;
  sessions: number;
  questions: number;
}

interface ActivityHeatmapProps {
  activityData: ActivityDay[];
  streakDays: number;
}

export default function ActivityHeatmap({ activityData, streakDays }: ActivityHeatmapProps) {
  const { weeks, maxQuestions } = useMemo(() => {
    // Create a map of dates to activity
    const activityMap = new Map<string, ActivityDay>();
    activityData.forEach((day) => {
      activityMap.set(day.date, day);
    });

    // Generate last 12 weeks of dates
    const today = new Date();
    const weeks: (ActivityDay | null)[][] = [];
    let maxQ = 0;

    // Start from 11 weeks ago, aligned to Sunday
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 83); // 12 weeks = 84 days - 1
    // Align to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    let currentDate = new Date(startDate);
    let currentWeek: (ActivityDay | null)[] = [];

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const activity = activityMap.get(dateStr) || null;

      if (activity && activity.questions > maxQ) {
        maxQ = activity.questions;
      }

      currentWeek.push(activity);

      if (currentDate.getDay() === 6) {
        // Saturday - end of week
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add remaining days
    if (currentWeek.length > 0) {
      // Pad with nulls for future days
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return { weeks, maxQuestions: maxQ || 1 };
  }, [activityData]);

  const getIntensityLevel = (questions: number): number => {
    if (questions === 0) return 0;
    const ratio = questions / maxQuestions;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="activity-heatmap">
      <div className="heatmap-header">
        <h2>Activity</h2>
        <div className="streak-indicator">
          <span className="streak-fire">🔥</span>
          <span className="streak-number">{streakDays}</span>
          <span className="streak-text">day streak</span>
        </div>
      </div>

      <div className="heatmap-container">
        <div className="day-labels">
          {dayLabels.map((day, i) => (
            <span key={day} className={i % 2 === 1 ? 'visible' : ''}>
              {day}
            </span>
          ))}
        </div>

        <div className="heatmap-grid">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="heatmap-week">
              {week.map((day, dayIndex) => {
                const dateStr =
                  day?.date ||
                  (() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 83 + weekIndex * 7 + dayIndex);
                    return d.toISOString().split('T')[0];
                  })();
                const isFuture = new Date(dateStr) > new Date();

                return (
                  <div
                    key={dayIndex}
                    className={`heatmap-cell level-${day ? getIntensityLevel(day.questions) : 0} ${isFuture ? 'future' : ''}`}
                    title={
                      isFuture
                        ? ''
                        : day
                          ? `${formatDate(day.date)}: ${day.sessions} session${day.sessions !== 1 ? 's' : ''}, ${day.questions} questions`
                          : `${formatDate(dateStr)}: No activity`
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="heatmap-legend">
        <span className="legend-label">Less</span>
        <div className="legend-cells">
          <div className="heatmap-cell level-0" />
          <div className="heatmap-cell level-1" />
          <div className="heatmap-cell level-2" />
          <div className="heatmap-cell level-3" />
          <div className="heatmap-cell level-4" />
        </div>
        <span className="legend-label">More</span>
      </div>
    </div>
  );
}
