export interface Task {
  id: string;
  title: string;
  weight: number; // The percentage value (0-100)
  completed: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  isRewardUnlocked: boolean;
  rewardRecommendation?: string;
}

// Planner Types
export type PlannerLevel = 'year' | 'month' | 'week' | 'day';

export interface PlannerGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface PlannerData {
  [key: string]: PlannerGoal[];
}

// Updated to support Nature days with notes
export type DayRecord = { score: number; isNature: boolean; note?: string };
export type ProductivityHistory = Record<string, DayRecord | number>; 

export interface Habit {
  id: string;
  title: string;
  // Record key: YYYY-MM-DD, value: 'done' | 'missed'
  history: Record<string, 'done' | 'missed'>;
  color: string; // Tailwind color class base
}

export interface Achievement {
  id: string;
  date: string;
  title: string;
  story: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CONSISTENCY = 'CONSISTENCY',
  PLANNER = 'PLANNER',
  LIBRARY = 'LIBRARY',
  ACHIEVEMENTS = 'ACHIEVEMENTS'
}