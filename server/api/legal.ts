import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import multer from 'multer';
import { storage } from '../storage';
import { InsertCase, InsertDocument, InsertAnalysis } from '../../shared/schema';

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

// This function would integrate with the actual backend model
// For now, it returns mock data in the same format as the Delhi High Court models
async function analyzeLegalDocument(filePath: string) {
  // In a real implementation, we would execute the Python code here
  // using child_process.exec or python-shell
  
  // Mock response format based on Delhi High Court model output
  return {
    metadata: {
      title: "Sample vs The State",
      case_number: "CRL.A. 123/2023",
      date: new Date().toISOString(),
      court: "Delhi High Court",
      judges: ["Justice A. K. Smith"],
      petitioner: "Appellant",
      respondent: "State",
      type: "Criminal Appeal"
    },
    similar_cases: [
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
      }
    ],
    prediction: {
      outcome: "Appeal Allowed",
      confidence: 0.78,
      reasoning: "Based on precedent and the facts presented, the court is likely to allow the appeal considering the evidence inconsistencies.",
      plaintiff_probability: 0.78,
      defendant_probability: 0.22
    },
    legal_principles: [
      "Burden of proof in criminal cases",
      "Evidentiary standards for criminal appeals",
      "Due process considerations"
    ],
    analysis: {
      strengths: [
        "Strong precedent supporting the appellant's position",
        "Inconsistencies in witness testimony"
      ],
      weaknesses: [
        "Limited documentary evidence",
        "Procedural delays may affect credibility"
      ]
    }
  };
}

export function setupLegalRoutes(app: any) {
  // Route to upload and analyze a legal document
  app.post('/api/documents/analyze', upload.single('document'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = req.file.path;
      const caseData = req.body;
      
      // Create case in storage
      const newCase = await storage.createCase({
        title: caseData.title || 'Untitled Case',
        description: caseData.description || '',
        caseType: caseData.type || 'General',
        userId: caseData.userId ? parseInt(caseData.userId) : 1, // Default user ID if not provided
      });
      
      // Create document in storage
      const document = await storage.createDocument({
        caseId: newCase.id,
        filename: req.file.originalname,
        fileType: req.file.mimetype,
        filePath: filePath,
        fileSize: req.file.size,
        pageCount: 1, // This would be determined by PDF processing
      });
      
      // Analyze the document
      const analysisResult = await analyzeLegalDocument(filePath);
      
      // Store analysis results
      const analysis = await storage.createAnalysis({
        caseId: newCase.id,
        summary: analysisResult.metadata.title,
        prediction: analysisResult.prediction,
        precedents: analysisResult.similar_cases,
        argumentAnalysis: {
          strengths: analysisResult.analysis.strengths,
          weaknesses: analysisResult.analysis.weaknesses
        }
      });
      
      res.status(201).json({
        caseId: newCase.id,
        documentId: document.id,
        analysisId: analysis.id,
        metadata: analysisResult.metadata,
        similar_cases: analysisResult.similar_cases,
        prediction: analysisResult.prediction,
        analysis: analysisResult.analysis
      });
    } catch (error) {
      console.error('Error analyzing document:', error);
      res.status(500).json({ error: 'Error analyzing document' });
    }
  });

  // Route to get case analysis
  app.get('/api/case-analysis/:caseId', async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.caseId);
      const analysis = await storage.getAnalysisByCaseId(caseId);
      
      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }
      
      const caseInfo = await storage.getCase(caseId);
      const documents = await storage.getDocumentsByCaseId(caseId);
      
      // Format the response
      const response = {
        id: analysis.id,
        caseTitle: caseInfo?.title || 'Unknown Case',
        caseType: caseInfo?.caseType || 'Unknown Type',
        summary: analysis.summary,
        documents: documents.map(doc => ({
          name: doc.filename, // Using client-side property names for UI compatibility
          size: doc.fileSize,
          pageCount: doc.pageCount || 0,
          description: doc.filename,
          tags: getDocumentTags(doc.filename)
        })),
        prediction: analysis.prediction,
        precedents: analysis.precedents,
        argumentAnalysis: analysis.argumentAnalysis,
        createdAt: analysis.createdAt.toISOString()
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
      // In a real implementation, we would query the similar cases from storage
      // or re-run the analysis on the document
      
      // Mock response for now
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

// Utility function to generate document tags
function getDocumentTags(filename: string): string[] {
  const tags = [];
  
  // Extract file extension
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf') tags.push('PDF');
  else if (ext === '.docx' || ext === '.doc') tags.push('Word Document');
  else if (ext === '.txt') tags.push('Text File');
  
  // Add mock tags based on filename patterns
  if (filename.toLowerCase().includes('petition')) tags.push('Petition');
  if (filename.toLowerCase().includes('appeal')) tags.push('Appeal');
  if (filename.toLowerCase().includes('evidence')) tags.push('Evidence');
  if (filename.toLowerCase().includes('exhibit')) tags.push('Exhibit');
  if (filename.toLowerCase().includes('testimony')) tags.push('Testimony');
  
  return tags;
}