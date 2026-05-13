"use client";

import { useState, useEffect, useCallback } from "react";

interface ProgressEntry {
  trackId: string;
  moduleId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
}

function getKey(profileId: string) {
  return `progress:${profileId}`;
}

export function useProgress(profileId: string | null) {
  const [progress, setProgress] = useState<Record<string, ProgressEntry>>({});

  useEffect(() => {
    if (!profileId) return;
    const stored = localStorage.getItem(getKey(profileId));
    if (stored) {
      try {
        setProgress(JSON.parse(stored));
      } catch {
        setProgress({});
      }
    } else {
      setProgress({});
    }
  }, [profileId]);

  const saveProgress = useCallback(
    (data: Record<string, ProgressEntry>) => {
      if (!profileId) return;
      setProgress(data);
      localStorage.setItem(getKey(profileId), JSON.stringify(data));
    },
    [profileId]
  );

  const markComplete = useCallback(
    (trackId: string, moduleId: string, lessonId: string) => {
      const key = `${trackId}:${moduleId}:${lessonId}`;
      const updated = {
        ...progress,
        [key]: { trackId, moduleId, lessonId, completed: true, completedAt: new Date().toISOString() },
      };
      saveProgress(updated);
    },
    [progress, saveProgress]
  );

  const markIncomplete = useCallback(
    (trackId: string, moduleId: string, lessonId: string) => {
      const key = `${trackId}:${moduleId}:${lessonId}`;
      const updated = { ...progress };
      delete updated[key];
      saveProgress(updated);
    },
    [progress, saveProgress]
  );

  const isCompleted = useCallback(
    (trackId: string, moduleId: string, lessonId: string) => {
      const key = `${trackId}:${moduleId}:${lessonId}`;
      return progress[key]?.completed === true;
    },
    [progress]
  );

  const getTrackProgress = useCallback(
    (trackId: string, totalLessons: number) => {
      const completed = Object.values(progress).filter(
        (p) => p.trackId === trackId && p.completed
      ).length;
      return { completed, total: totalLessons, percent: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0 };
    },
    [progress]
  );

  const getRecentlyCompleted = useCallback(
    (limit = 5) => {
      return Object.values(progress)
        .filter((p) => p.completed && p.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
        .slice(0, limit);
    },
    [progress]
  );

  return { progress, markComplete, markIncomplete, isCompleted, getTrackProgress, getRecentlyCompleted };
}
