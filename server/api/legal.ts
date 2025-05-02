import { Request, Response } from 'express';
import { storage } from '../storage';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { extractTextFromPdf, extractMetadata, generateDocumentId } from '../utils/pdfProcessor';
import { generateFullAnalysis, findSimilarCases, predictJudgment } from '../utils/legalAnalyzer';
import { virtualJudge } from '../utils/virtualJudge';

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
});

async function analyzeLegalDocument(filePath: string) {
  try {
    // Extract text from PDF
    const text = await extractTextFromPdf(filePath);
    
    // Generate full analysis
    const analysis = generateFullAnalysis(text);
    
    // Get AI summary if available
    try {
      const aiSummary = await virtualJudge.analyzeCaseSummary(text);
      analysis.ai_summary = aiSummary;
    } catch (error) {
      console.error('Error getting AI summary:', error);
      // Continue without AI summary
      analysis.ai_summary = null;
    }
    
    return {
      text,
      analysis
    };
  } catch (error) {
    console.error('Error analyzing document:', error);
    throw error;
  }
}

export function setupLegalRoutes(app: any) {
  // Handle document uploads and analysis
  app.post('/api/documents/analyze', upload.single('document'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Get file details
      const filePath = req.file.path;
      const originalName = req.file.originalname;
      const fileSize = req.file.size;
      const fileType = req.file.mimetype;
      
      // Analyze the document
      const { text, analysis } = await analyzeLegalDocument(filePath);
      
      // Create a case
      const newCase = await storage.createCase({
        title: analysis.metadata.title || originalName,
        caseType: analysis.metadata.type || 'General Case',
        description: `Uploaded on ${new Date().toLocaleDateString()}`,
        userId: 1 // Default user ID
      });
      
      // Save document to the database
      const document = await storage.createDocument({
        caseId: newCase.id,
        filename: originalName,
        fileSize: fileSize,
        fileType: fileType,
        filePath: filePath,
        pageCount: 1 // Default, would be extracted from PDF in a full implementation
      });
      
      // Save analysis to the database
      const savedAnalysis = await storage.createAnalysis({
        caseId: newCase.id,
        summary: analysis.ai_summary || 'Document analysis complete',
        prediction: analysis.prediction,
        precedents: analysis.similar_cases,
        argumentAnalysis: analysis.analysis
      });
      
      // Return the analysis results
      res.json({
        caseId: newCase.id,
        documentId: document.id,
        metadata: analysis.metadata,
        prediction: analysis.prediction,
        similarCases: analysis.similar_cases,
        legalPrinciples: analysis.legal_principles,
        argumentAnalysis: analysis.analysis,
        summary: analysis.ai_summary
      });
    } catch (error) {
      console.error('Error analyzing document:', error);
      res.status(500).json({ error: 'Error analyzing document' });
    }
  });
  
  // Get case analysis
  app.get('/api/case-analysis/:caseId', async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.caseId);
      if (isNaN(caseId)) {
        return res.status(400).json({ error: 'Invalid case ID' });
      }
      
      // Get the case
      const caseData = await storage.getCase(caseId);
      if (!caseData) {
        return res.status(404).json({ error: 'Case not found' });
      }
      
      // Get the analysis
      const analysis = await storage.getAnalysisByCaseId(caseId);
      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }
      
      // Get the documents for this case
      const documents = await storage.getDocumentsByCaseId(caseId);
      
      // Format the response
      const response = {
        caseId: caseData.id,
        title: caseData.title,
        caseType: caseData.caseType,
        description: caseData.description,
        documents: documents.map(doc => ({
          id: doc.id,
          filename: doc.filename,
          fileType: doc.fileType,
          fileSize: doc.fileSize
        })),
        prediction: analysis.prediction,
        precedents: analysis.precedents,
        argumentAnalysis: analysis.argumentAnalysis,
        createdAt: typeof analysis.createdAt === 'object' && analysis.createdAt instanceof Date ? 
          analysis.createdAt.toISOString() : 
          (typeof analysis.createdAt === 'string' ? analysis.createdAt : new Date().toISOString())
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error retrieving case analysis:', error);
      res.status(500).json({ error: 'Error retrieving case analysis' });
    }
  });
  
  // Route to get similar cases for a document
  app.get('/api/documents/:documentId/similar-cases', async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.documentId);
      if (isNaN(documentId)) {
        return res.status(400).json({ error: 'Invalid document ID' });
      }
      
      // In a real app, we would find the document and get its case ID
      // Then get the analysis for that case and return the similar cases
      // For now, return a simplified response with hardcoded similar cases
      
      res.json([
        {
          title: "State vs John Doe",
          citation: "(2022) DLT 123",
          similarity: 0.85,
          summary: "This case involved similar legal principles regarding criminal procedure.",
          year: 2022
        },
        {
          title: "Jane Doe vs State",
          citation: "(2021) DLT 456",
          similarity: 0.75,
          summary: "This case set precedent for similar factual scenarios.",
          year: 2021
        },
        {
          title: "Legal Authority vs Respondent",
          citation: "(2019) DLT 789",
          similarity: 0.65,
          summary: "This case established the standard for reviewing similar legal questions.",
          year: 2019
        }
      ]);
    } catch (error) {
      console.error('Error retrieving similar cases:', error);
      res.status(500).json({ error: 'Error retrieving similar cases' });
    }
  });
}
