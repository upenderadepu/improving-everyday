export type LessonType = "lesson" | "lab" | "quiz" | "project" | "exercise";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface Lesson {
  id: string;
  title: string;
  duration: number; // minutes
  type: LessonType;
  description: string;
  content: string; // Markdown
  objectives?: string[];
  tags?: string[];
}

export interface Module {
  id: string;
  title: string;
  level: DifficultyLevel;
  description: string;
  lessons: Lesson[];
}

export interface Track {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  icon: string;
  color: string;
  gradient: string;
  modules: Module[];
  tags: string[];
}

export interface LessonWithContext {
  lesson: Lesson;
  module: Module;
  track: Track;
  prevLesson: { trackId: string; moduleId: string; lessonId: string; title: string } | null;
  nextLesson: { trackId: string; moduleId: string; lessonId: string; title: string } | null;
}
