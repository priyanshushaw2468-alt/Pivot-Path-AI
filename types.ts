export interface Resource {
  title: string;
  type: 'Course' | 'Book' | 'Article' | 'Tool';
  provider?: string;
  url?: string;
  duration?: string;
}

export interface Milestone {
  title: string;
  duration: string;
  description: string;
  keyActions: string[];
  resources: Resource[];
}

export interface ATSAnalysis {
  score: number;
  matchLevel: 'Low' | 'Medium' | 'High';
  missingKeywords: string[];
  formattingIssues: string[];
  tips: string[];
}

export interface RoadmapData {
  summary: string;
  currentAnalysis: string;
  gapAnalysis: string[];
  timeline: Milestone[];
  estimatedTotalTime: string;
  atsAnalysis: ATSAnalysis;
}

export interface UserProfile {
  resumeText: string;
  resumeData?: {
    mimeType: string;
    data: string;
  };
  resumeFileName?: string;
  currentRole: string;
  targetRole: string;
  targetIndustry: string;
  topSkills: string[];
  learningStyle: 'Visual' | 'Hands-on' | 'Reading' | 'Mixed';
}

export type AppScreen = 'home' | 'wizard' | 'processing' | 'results' | 'export' | 'error';

export interface WizardState {
  step: number;
  data: UserProfile;
}