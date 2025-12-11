export enum FormattingStyle {
  ABNT = 'ABNT',
  APA = 'APA',
  IEEE = 'IEEE',
  CHICAGO = 'CHICAGO'
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED'
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  isGenerated: boolean;
  order: number;
}

export interface TCCProject {
  id: string;
  title: string;
  course: string;
  style: FormattingStyle;
  researchProblem?: string;
  objectives?: string;
  methodology?: string;
  createdAt: number;
  updatedAt: number;
  chapters: Chapter[];
}

export interface GenerationRequest {
  topic: string;
  course: string;
  style: FormattingStyle;
  additionalContext?: string;
}

export interface AIModelResponse {
  text: string;
}

export interface PlagiarismMatch {
  text: string;
  source: string;
  similarity: number;
  url?: string;
}

export interface PlagiarismResult {
  score: number;
  matches: PlagiarismMatch[];
  scannedAt: number;
}