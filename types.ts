
export enum EvidenceType {
  MESSAGE = 'MESSAGE',
  DOCUMENT = 'DOCUMENT',
  EMAIL = 'EMAIL',
  PHOTO = 'PHOTO',
  INCIDENT = 'INCIDENT'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  DISPUTED = 'DISPUTED'
}

export type Lane = 'CUSTODY' | 'FINANCIAL' | 'SAFETY' | 'PROCEDURAL';

export interface StickyNote {
  id: string;
  text: string;
  x: number;
  y: number;
  targetId?: string;
}

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  sender: string;
  content: string;
  contentNeutral?: string;
  timestamp: string | Date;
  hash: string;
  verified: boolean;
  verificationStatus: VerificationStatus;
  isInTimeline: boolean;
  notes?: string;
  exhibitCode?: string;
  conflicts?: string[];
  lane: Lane;
  tags: string[];
  reliability?: string;
  source?: string;
}

export interface NarrativeEvent {
  id: string;
  title: string;
  description: string;
  lane: Lane;
  timestamp: string;
  linkedEvidenceIds: string[];
}

export enum ActiveLayer {
  SPINE = 'SPINE',
  TIMELINE = 'TIMELINE',
  NOTES = 'NOTES',
  AI = 'AI',
  KNOWLEDGE = 'KNOWLEDGE',
  MOTIONS = 'MOTIONS',
  LIVE = 'LIVE'
}

export interface AnalysisResult {
  readinessScore: number;
  conflicts: string[];
  suggestions: string[];
  summary: string;
  strategicAlignment: string;
  sayLessStrategy: string;
  agentName?: string;
}

export interface AgentStatus {
  id: string;
  name: string;
  status: 'IDLE' | 'BUSY' | 'ERROR';
  task: string;
}

export interface LegalRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface Anchor {
  id: string;
  type: 'STRATEGIC' | 'LEGAL' | 'CONSTITUTIONAL';
  title: string;
  content: string;
}
