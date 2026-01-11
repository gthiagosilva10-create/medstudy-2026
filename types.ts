
export enum StudyStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REVIEWED = 'REVIEWED'
}

export interface Topic {
  id: string;
  name: string;
  subArea?: string;
  status: StudyStatus;
  observations?: string;
  subTopics?: string[];
}

export interface Area {
  id: string;
  name: string;
  icon: string;
  topics: Topic[];
  color: string;
  summary?: string;
}

export interface ExamRecord {
  id: string;
  name: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  observations: string;
}

export interface VideoLesson {
  id: string;
  title: string;
  areaId: string;
  isWatched: boolean;
  addedAt: string;
}

export interface CurriculumDoc {
  id: string;
  name: string;
  category: 'edital' | 'curriculo' | 'provas' | 'outros';
  type: 'pdf' | 'image' | 'link';
  url: string;
  addedAt: string;
  fileSize?: string;
}

export interface Flashcard {
  id: string;
  areaId: string;
  front: string;
  back: string;
  lastReviewed?: string;
}

export type WeeklySchedule = Record<number, string[]>;
export type MonthlyPlans = Record<string, string>;

export interface StudyPlan {
  areas: Area[];
  exams: ExamRecord[];
  weeklySchedule: WeeklySchedule;
  monthlyPlans: MonthlyPlans;
  startDate: string;
  weeks: number;
}
