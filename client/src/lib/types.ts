// Types for case information
export interface CaseInfo {
  id: string;
  title: string;
  type: string;
  description?: string;
  documentCount: number;
  pageCount: number;
  createdAt: string;
}

// Types for document analysis
export interface DocumentAnalysis {
  name: string;
  size: number;
  pageCount: number;
  description: string;
  tags: string[];
}

// Types for outcome prediction
export interface OutcomePrediction {
  plaintiffOutcome: number;
  defendantOutcome: number;
  basis: string;
  explanation: string;
  confidence: number;
}

// Types for case precedents
export interface CasePrecedent {
  title: string;
  description: string;
  similarity: number;
  year?: number;
}

// Types for argument analysis
export interface ArgumentAnalysis {
  strengths: string[];
  weaknesses: string[];
}

// Combined case analysis type
export interface CaseAnalysis {
  id: string;
  caseTitle: string;
  caseType: string;
  summary: string;
  documents: DocumentAnalysis[];
  prediction: OutcomePrediction;
  precedents: CasePrecedent[];
  argumentAnalysis?: ArgumentAnalysis;
  createdAt: string;
}

// Chat message type
export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

// Chat session type
export interface ChatSession {
  id: string;
  title: string;
  caseId?: string;
  messageCount: number;
  timestamp: string;
}
