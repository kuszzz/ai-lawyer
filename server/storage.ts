import {
  users, type User, type InsertUser,
  cases, type Case, type InsertCase,
  documents, type Document, type InsertDocument,
  analyses, type Analysis, type InsertAnalysis,
  chatSessions, type ChatSession, type InsertChatSession,
  chatMessages, type ChatMessage, type InsertChatMessage
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Cases
  createCase(caseData: InsertCase): Promise<Case>;
  getCase(id: number): Promise<Case | undefined>;
  getCasesByUserId(userId: number): Promise<Case[]>;
  getMostRecentCase(): Promise<Case | undefined>;
  
  // Documents
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByCaseId(caseId: number): Promise<Document[]>;
  
  // Analyses
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysisByCaseId(caseId: number): Promise<Analysis | undefined>;
  
  // Chat Sessions
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: number): Promise<ChatSession | undefined>;
  getChatSessionsByUserId(userId: number): Promise<ChatSession[]>;
  getChatSessionsByCaseId(caseId: number): Promise<ChatSession[]>;
  
  // Chat Messages
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesBySessionId(sessionId: number): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cases: Map<number, Case>;
  private documents: Map<number, Document>;
  private analyses: Map<number, Analysis>;
  private chatSessions: Map<number, ChatSession>;
  private chatMessages: Map<number, ChatMessage>;
  
  private currentUserId: number;
  private currentCaseId: number;
  private currentDocumentId: number;
  private currentAnalysisId: number;
  private currentSessionId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.cases = new Map();
    this.documents = new Map();
    this.analyses = new Map();
    this.chatSessions = new Map();
    this.chatMessages = new Map();
    
    this.currentUserId = 1;
    this.currentCaseId = 1;
    this.currentDocumentId = 1;
    this.currentAnalysisId = 1;
    this.currentSessionId = 1;
    this.currentMessageId = 1;
    
    // Add a default user
    this.createUser({
      username: "demo",
      password: "password",
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Case methods
  async createCase(insertCase: InsertCase): Promise<Case> {
    const id = this.currentCaseId++;
    const newCase: Case = { 
      ...insertCase, 
      id,
      createdAt: new Date().toISOString()
    };
    this.cases.set(id, newCase);
    return newCase;
  }
  
  async getCase(id: number): Promise<Case | undefined> {
    return this.cases.get(id);
  }
  
  async getCasesByUserId(userId: number): Promise<Case[]> {
    return Array.from(this.cases.values()).filter(
      (c) => c.userId === userId
    );
  }
  
  async getMostRecentCase(): Promise<Case | undefined> {
    const casesArray = Array.from(this.cases.values());
    return casesArray.length > 0 
      ? casesArray.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : undefined;
  }
  
  // Document methods
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = { 
      ...insertDocument, 
      id,
      createdAt: new Date().toISOString()
    };
    this.documents.set(id, document);
    return document;
  }
  
  async getDocumentsByCaseId(caseId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.caseId === caseId
    );
  }
  
  // Analysis methods
  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.currentAnalysisId++;
    const analysis: Analysis = { 
      ...insertAnalysis, 
      id,
      createdAt: new Date().toISOString()
    };
    this.analyses.set(id, analysis);
    return analysis;
  }
  
  async getAnalysisByCaseId(caseId: number): Promise<Analysis | undefined> {
    return Array.from(this.analyses.values()).find(
      (analysis) => analysis.caseId === caseId
    );
  }
  
  // Chat Session methods
  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = this.currentSessionId++;
    const session: ChatSession = { 
      ...insertSession, 
      id,
      createdAt: new Date().toISOString()
    };
    this.chatSessions.set(id, session);
    return session;
  }
  
  async getChatSession(id: number): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }
  
  async getChatSessionsByUserId(userId: number): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getChatSessionsByCaseId(caseId: number): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values())
      .filter(session => session.caseId === caseId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  // Chat Message methods
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const message: ChatMessage = { 
      ...insertMessage, 
      id,
      createdAt: new Date().toISOString()
    };
    this.chatMessages.set(id, message);
    return message;
  }
  
  async getChatMessagesBySessionId(sessionId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
}

export const storage = new MemStorage();
