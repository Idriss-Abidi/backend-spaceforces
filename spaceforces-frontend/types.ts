export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  rank: Rank;
  points: number;
  description?: string;
}

export interface DecodedToken {
  sub: string;
  userId: number;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

export interface Rank {
  id: number;
  title: string;
  abbreviation: string;
  minPoints: number;
  maxPoints: number;
}

export interface ContestDifficulty {
  id: number;
  diff: string;
  abbreviation: string;
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  difficulty: ContestDifficulty;
  topic?: string;
  createdBy: User;
  createdAt?: string;
  startDateTime?: string;
  duration: number;
  status: string;
  mode: string;
}

export interface QuizQuestion {
  id: number;
  questionText: string;
  points: number;
  tags?: string;
  imageUrl?: string;
  correctOption?: string;
}

export interface Option {
  id: number;
  optionText: string;
  valid: boolean;
}

export interface QuestionWithOptions extends QuizQuestion {
  options: Option[];
}

export interface QuizDetails {
  id: number;
  title: string;
  description?: string;
  difficultyId: ContestDifficulty;
  topic?: string;
  createdById: User;
  createdAt?: string;
  startDateTime?: string;
  duration: number;
  status: string;
  mode: string;
  questions: QuestionWithOptions[];
}

export interface Participation {
  id: number;
  user: User;
  quiz: Quiz;
  score: number;
  completionTime: string;
}

export interface Submission {
  id: number;
  questionId: number;
  optionId: number;
  score: number;
  completionTime: string;
}

export enum QuizStatus {
  CREATED = "CREATED",
  LIVE = "LIVE",
  FINISHED = "FINISHED",
}
