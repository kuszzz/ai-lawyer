import { Request, Response } from 'express';
import { storage } from '../storage';
import { virtualJudge } from '../utils/virtualJudge';
import { v4 as uuidv4 } from 'uuid';

export function setupChatRoutes(app: any) {
  // GET chat sessions for a user
  app.get('/api/chat/sessions', async (req: Request, res: Response) => {
    try {
      // In a real app, this would get the user ID from authentication
      const userId = 1; // Default user ID for now
      
      const sessions = await storage.getChatSessionsByUserId(userId);
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      res.status(500).json({ error: 'Error fetching chat sessions' });
    }
  });
  
  // GET chat sessions for a specific case
  app.get('/api/chat/sessions/case/:caseId', async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.caseId);
      if (isNaN(caseId)) {
        return res.status(400).json({ error: 'Invalid case ID' });
      }
      
      const sessions = await storage.getChatSessionsByCaseId(caseId);
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching case chat sessions:', error);
      res.status(500).json({ error: 'Error fetching case chat sessions' });
    }
  });
  
  // GET messages for a specific chat session
  app.get('/api/chat/sessions/:sessionId/messages', async (req: Request, res: Response) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      if (isNaN(sessionId)) {
        return res.status(400).json({ error: 'Invalid session ID' });
      }
      
      const messages = await storage.getChatMessagesBySessionId(sessionId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      res.status(500).json({ error: 'Error fetching chat messages' });
    }
  });
  
  // POST to create a new chat session
  app.post('/api/chat/sessions', async (req: Request, res: Response) => {
    try {
      const { title, caseId, userId } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      
      // Create a new chat session
      const newSession = await storage.createChatSession({
        title,
        userId: userId || 1, // Default user ID if not provided
        caseId: caseId || null // Optional case ID
      });
      
      // If case ID is provided, set the virtual judge context
      if (caseId) {
        try {
          const caseData = await storage.getCase(caseId);
          if (caseData) {
            // Set context for the virtual judge to provide more relevant responses
            virtualJudge.setCaseContext(`Case: ${caseData.title}, Type: ${caseData.caseType}`);
          }
        } catch (err) {
          console.error('Error setting case context for virtual judge:', err);
          // Continue without setting context
          virtualJudge.setCaseContext(null);
        }
      } else {
        virtualJudge.setCaseContext(null);
      }
      
      res.status(201).json(newSession);
    } catch (error) {
      console.error('Error creating chat session:', error);
      res.status(500).json({ error: 'Error creating chat session' });
    }
  });
  
  // POST to send a message and get AI response
  app.post('/api/chat/message', async (req: Request, res: Response) => {
    try {
      const { sessionId, message, userId } = req.body;
      
      if (!sessionId || !message) {
        return res.status(400).json({ error: 'Session ID and message are required' });
      }
      
      // Store user message
      const userMessage = await storage.createChatMessage({
        sessionId,
        content: message,
        role: 'user'
      });
      
      // Get response from the virtual judge
      const aiResponse = await virtualJudge.getResponse(message);
      
      // Store AI response
      const judgeMessage = await storage.createChatMessage({
        sessionId,
        content: aiResponse,
        role: 'assistant'
      });
      
      // Return both messages
      res.json({
        userMessage,
        judgeMessage
      });
    } catch (error) {
      console.error('Error processing chat message:', error);
      res.status(500).json({ error: 'Error processing chat message' });
    }
  });
  
  // Simple endpoint to chat without session management (for quick testing)
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { message, caseId } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      // Set case context if provided
      if (caseId) {
        try {
          const caseData = await storage.getCase(parseInt(caseId));
          if (caseData) {
            virtualJudge.setCaseContext(`Case: ${caseData.title}, Type: ${caseData.caseType}`);
          }
        } catch (err) {
          console.error('Error setting case context for virtual judge:', err);
          virtualJudge.setCaseContext(null);
        }
      } else {
        virtualJudge.setCaseContext(null);
      }
      
      // Get response from the virtual judge
      const response = await virtualJudge.getResponse(message);
      
      res.json({ message: response });
    } catch (error) {
      console.error('Error processing chat:', error);
      res.status(500).json({ error: 'Error processing chat' });
    }
  });
}
