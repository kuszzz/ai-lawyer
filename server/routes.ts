import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { setupLegalRoutes } from "./api/legal";
import { setupChatRoutes } from "./api/chat";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up legal and chat API routes
  setupLegalRoutes(app);
  setupChatRoutes(app);

  // API routes
  
  // Case routes
  app.get("/api/cases/recent", async (req, res) => {
    try {
      const recentCase = await storage.getMostRecentCase();
      
      if (!recentCase) {
        return res.status(404).json({ message: "No cases found" });
      }
      
      res.json({
        id: recentCase.id,
        title: recentCase.title,
        description: recentCase.description,
        caseType: recentCase.caseType,
        createdAt: recentCase.createdAt
      });
    } catch (error) {
      console.error("Error fetching recent case:", error);
      res.status(500).json({ message: "Error fetching recent case" });
    }
  });
  
  // User routes
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // In a real app, we would set up a session here
    res.json({
      id: user.id,
      username: user.username,
    });
  });
  
  // File upload route
  app.post("/api/upload", upload.array("files"), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const { caseTitle, caseType, caseDescription, analysisOptions, analysisDepth, jurisdiction } = req.body;
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files were uploaded" });
      }
      
      if (!caseTitle || !caseType) {
        return res.status(400).json({ message: "Case title and type are required" });
      }
      
      // Create a new case
      const newCase = await storage.createCase({
        title: caseTitle,
        caseType: caseType,
        description: caseDescription || "",
        userId: 1, // Using demo user for now
      });
      
      // Save document information
      const documents = await Promise.all(
        files.map(async (file) => {
          return await storage.createDocument({
            caseId: newCase.id,
            filename: file.originalname,
            fileSize: file.size,
            fileType: file.mimetype,
            filePath: file.path,
            pageCount: Math.floor(Math.random() * 10) + 5, // In a real app, this would be calculated from the file
          });
        })
      );
      
      // Parse analysis options
      const options = analysisOptions ? JSON.parse(analysisOptions) : {};
      
      // Create a sample analysis
      // In a real app, this would be done by analyzing the uploaded documents
      const analysis = await storage.createAnalysis({
        caseId: newCase.id,
        summary: `<p>This case involves a ${caseType} dispute. Based on the provided documents, the following legal issues have been identified:</p>
        <ul>
          <li>Validity of agreements between parties</li>
          <li>Potential breach of contractual obligations</li>
          <li>Claims related to specific performance</li>
        </ul>
        <p>The documents show evidence supporting several claims made by the plaintiff. There are potential counter-arguments based on the terms in the agreement that could be made by the defendant.</p>`,
        prediction: {
          plaintiffOutcome: 76,
          defendantOutcome: 24,
          basis: `Prediction based on similar cases and relevant precedents from ${jurisdiction === 'delhi' ? 'Delhi High Court' : 'relevant jurisdictions'}.`,
          explanation: `The analysis suggests a strong position for the plaintiff based on documented evidence and clear contractual terms.`,
          confidence: 82
        },
        precedents: [
          {
            title: "M/s ABC Developers v. XYZ Properties (2019)",
            description: "Plaintiff awarded specific performance of development agreement after demonstrating clear breach.",
            similarity: 87
          },
          {
            title: "Singh Estates v. Metropolitan Corp (2021)",
            description: "Court upheld validity of similarly structured agreement with conditional clauses.",
            similarity: 72
          },
          {
            title: "Rajesh Properties v. Suntech Buildings (2018)",
            description: "Defendant prevailed when evidence of written amendments to original agreement was produced.",
            similarity: 68
          }
        ],
        argumentAnalysis: options.argumentAnalysis ? {
          strengths: [
            "Strong documentary evidence of agreement terms",
            "Clear chronology of communications showing breach",
            "Precedents favor similar factual scenarios"
          ],
          weaknesses: [
            "Potential procedural delays due to jurisdiction questions",
            "Limited evidence of damages quantification",
            "Possible counter-arguments regarding force majeure clause"
          ]
        } : undefined
      });
      
      // Create a new chat session for this case
      const session = await storage.createChatSession({
        userId: 1,
        caseId: newCase.id,
        title: `${caseTitle} - Initial Consultation`
      });
      
      // Add welcome message
      await storage.createChatMessage({
        sessionId: session.id,
        role: "assistant",
        content: `Welcome to your case consultation for ${caseTitle}. I've analyzed your documents and prepared insights on your ${caseType} case. Based on my analysis, your case has several strengths, particularly regarding the documentary evidence. How can I assist you with your case today?`
      });
      
      res.status(201).json({
        caseId: newCase.id,
        documentCount: documents.length,
        message: "Files uploaded and analysis started"
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "An error occurred during upload" });
    }
  });
  
  // Case routes
  app.get("/api/cases/recent", async (req, res) => {
    try {
      const recentCase = await storage.getMostRecentCase();
      
      if (!recentCase) {
        return res.status(404).json({ message: "No cases found" });
      }
      
      res.json({
        id: recentCase.id,
        title: recentCase.title
      });
    } catch (error) {
      console.error("Error fetching recent case:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.get("/api/cases/:id", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const caseData = await storage.getCase(caseId);
      
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      const documents = await storage.getDocumentsByCaseId(caseId);
      
      res.json({
        id: caseData.id,
        title: caseData.title,
        type: caseData.caseType,
        description: caseData.description,
        documentCount: documents.length,
        pageCount: documents.reduce((sum, doc) => sum + (doc.pageCount || 0), 0),
        createdAt: caseData.createdAt
      });
    } catch (error) {
      console.error("Error fetching case:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  // Analysis routes
  app.get("/api/case-analysis/:id", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const caseData = await storage.getCase(caseId);
      
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      const analysis = await storage.getAnalysisByCaseId(caseId);
      
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      const documents = await storage.getDocumentsByCaseId(caseId);
      
      // Create document analysis objects
      const documentAnalyses = documents.map(doc => ({
        name: doc.filename,
        size: doc.fileSize,
        pageCount: doc.pageCount || 0,
        description: `Contains ${doc.fileType.includes('pdf') ? 'PDF document' : 'text document'} with relevant case information.`,
        tags: getDocumentTags(doc.filename)
      }));
      
      res.json({
        id: analysis.id,
        caseTitle: caseData.title,
        caseType: caseData.caseType,
        summary: analysis.summary,
        documents: documentAnalyses,
        prediction: analysis.prediction,
        precedents: analysis.precedents,
        argumentAnalysis: analysis.argumentAnalysis,
        createdAt: analysis.createdAt
      });
    } catch (error) {
      console.error("Error fetching analysis:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  // Chat session routes
  app.get("/api/chat-sessions", async (req, res) => {
    try {
      const sessions = await storage.getChatSessionsByUserId(1); // Using demo user
      
      const formattedSessions = await Promise.all(
        sessions.map(async (session) => {
          const messages = await storage.getChatMessagesBySessionId(session.id);
          return {
            id: session.id,
            title: session.title,
            caseId: session.caseId,
            messageCount: messages.length,
            timestamp: session.createdAt
          };
        })
      );
      
      res.json(formattedSessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.post("/api/chat-sessions", async (req, res) => {
    try {
      const { caseId, title } = req.body;
      
      const session = await storage.createChatSession({
        userId: 1, // Using demo user
        caseId: caseId ? parseInt(caseId) : undefined,
        title: title || "New Consultation"
      });
      
      // Add welcome message
      await storage.createChatMessage({
        sessionId: session.id,
        role: "system",
        content: "Virtual Judge AI is ready to assist you with your legal questions."
      });
      
      if (caseId) {
        const caseData = await storage.getCase(parseInt(caseId));
        if (caseData) {
          await storage.createChatMessage({
            sessionId: session.id,
            role: "assistant",
            content: `Welcome to your case consultation for ${caseData.title}. I've analyzed your documents and prepared insights on your ${caseData.caseType} case. How can I assist you today?`
          });
        }
      }
      
      res.status(201).json({
        id: session.id,
        title: session.title,
        timestamp: session.createdAt
      });
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  // Chat message routes
  app.get("/api/chat/:sessionId/messages", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const messages = await storage.getChatMessagesBySessionId(sessionId);
      
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt
      }));
      
      res.json(formattedMessages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.post("/api/chat", async (req, res) => {
    try {
      const { content, sessionId, caseId } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      let activeSessionId = sessionId;
      
      // If no session ID provided, create a new one or use the one for the case
      if (!activeSessionId) {
        if (caseId) {
          const caseSessions = await storage.getChatSessionsByCaseId(parseInt(caseId));
          if (caseSessions.length > 0) {
            activeSessionId = caseSessions[0].id;
          } else {
            const caseData = await storage.getCase(parseInt(caseId));
            const newSession = await storage.createChatSession({
              userId: 1,
              caseId: parseInt(caseId),
              title: caseData ? `${caseData.title} - Consultation` : "New Consultation"
            });
            activeSessionId = newSession.id;
          }
        } else {
          const newSession = await storage.createChatSession({
            userId: 1,
            title: "General Consultation"
          });
          activeSessionId = newSession.id;
        }
      }
      
      // Store user message
      await storage.createChatMessage({
        sessionId: activeSessionId,
        role: "user",
        content
      });
      
      // Generate AI response
      // In a real app, this would connect to a language model API
      const responseContent = generateAIResponse(content, caseId);
      
      // Store AI response
      const aiMessage = await storage.createChatMessage({
        sessionId: activeSessionId,
        role: "assistant",
        content: responseContent
      });
      
      res.json({
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseContent,
        timestamp: aiMessage.createdAt
      });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function for document tags
function getDocumentTags(filename: string): string[] {
  const tags = [];
  
  if (filename.toLowerCase().includes("brief")) {
    tags.push("Legal Brief");
  }
  
  if (filename.toLowerCase().includes("evidence")) {
    tags.push("Documentary Evidence");
  }
  
  if (filename.toLowerCase().includes("contract") || filename.toLowerCase().includes("agreement")) {
    tags.push("Contract");
  }
  
  if (filename.toLowerCase().includes("communication")) {
    tags.push("Communication Records");
  }
  
  // Add some default tags if none were found
  if (tags.length === 0) {
    tags.push("Legal Document");
    if (filename.toLowerCase().endsWith(".pdf")) {
      tags.push("PDF Document");
    } else if (filename.toLowerCase().endsWith(".txt")) {
      tags.push("Text Document");
    }
  }
  
  return tags;
}

// Helper function to generate AI responses
function generateAIResponse(userMessage: string, caseId?: string | null): string {
  const legalTerms = [
    "legal precedent", "jurisdiction", "evidence", "testimony", "plaintiff", "defendant",
    "court ruling", "contractual obligation", "breach of contract", "liability", "damages",
    "legal argument", "statute", "case law", "legal doctrine", "legal principle"
  ];
  
  const responses = [
    `Based on my analysis of the case documents, I would note that ${legalTerms[Math.floor(Math.random() * legalTerms.length)]} is particularly relevant to your question. The evidence suggests that there are strong arguments to be made regarding the contractual obligations between the parties.`,
    
    `Your question raises an important point about ${legalTerms[Math.floor(Math.random() * legalTerms.length)]}. Looking at similar precedents, courts have typically favored the party that can demonstrate clear documentation of agreements and communications. In your case, the documentation appears to support your position.`,
    
    `I've analyzed several similar cases, and the courts typically consider three key factors in such matters: 
    1. The clarity of contractual terms
    2. Evidence of communications between parties
    3. Documentation of any alleged breaches
    
    In your case, the second factor seems particularly strong based on the documents provided.`,
    
    `From a legal perspective, your question touches on the concept of ${legalTerms[Math.floor(Math.random() * legalTerms.length)]}. The documents you've provided show a potential line of argument related to the timing and nature of communications between the parties. This could be strengthened by focusing on the specific clauses in the agreement dated March 15, 2020.`,
    
    `Based on my analysis, there are three relevant legal precedents that address your question:
    1. Singh v. Metropolitan Corp (2021) - Which established that similar contractual language requires strict adherence
    2. Patel Construction v. Northland (2017) - Which addressed remedies for partial performance
    3. ABC Developers v. XYZ Properties (2019) - Which ruled on the specific performance remedy in similar circumstances
    
    The third case is particularly relevant to your situation.`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}
