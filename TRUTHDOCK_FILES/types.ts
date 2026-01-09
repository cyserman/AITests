
export enum PanelTab {
  NOTEPAD = 'NOTEPAD',
  CHAT = 'CHAT',
  LIVE = 'LIVE',
  CONFLICT = 'CONFLICT',
  SETTINGS = 'SETTINGS',
  TERMINAL = 'TERMINAL'
}

export interface User {
  username: string;
  id: string;
}

export interface NoteRevision {
  id: string;
  content: string;
  rawContent: string;
  timestamp: number;
  author: string;
  hash: string;
}

export interface Note {
  id: string;
  content: string; 
  rawContent: string;
  timestamp: number;
  lastModified: number;
  type: 'text' | 'voice' | 'file' | 'spine';
  fileName?: string;
  hash?: string;
  isVerified?: boolean;
  revisions: NoteRevision[];
  lane?: 'Plaintiff' | 'Defendant' | 'Neutral' | 'Evidence' | 'Spine';
  confidence: number;
  isSanitized: boolean;
}

export interface ConflictItem {
  id: string;
  statementA: string;
  statementB: string;
  analysis: string;
  severity: 'high' | 'medium' | 'low';
}

export interface RejectedItem {
  name: string;
  reason: 'Duplicate Content' | 'Stale Version' | 'Empty' | 'Invalid File Type';
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  urls?: { uri: string; title: string }[];
}

export interface ProcessedRecord {
  category: string;
  entity: string;
  details: string;
  evidence: string;
  legal_relevance: string;
  date?: string;
}

export interface Suggestion {
  id: string;
  type: 'recommendation' | 'clarification';
  text: string;
  targetId?: string;
}

export interface TerminalEntry {
  type: 'command' | 'output' | 'error' | 'success';
  text: string;
}
