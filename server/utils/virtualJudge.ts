import fetch from 'node-fetch';

// Ollama API endpoint (default for local installation)
const OLLAMA_API_ENDPOINT = process.env.OLLAMA_API_ENDPOINT || 'http://localhost:11434/api';
// Default model to use
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2';

/**
 * Virtual Judge AI that can analyze legal questions and provide conversational responses
 * using a locally hosted Ollama instance
 */
export class VirtualJudge {
  private model: string;
  private caseContext: string | null = null;
  
  constructor(model: string = OLLAMA_MODEL) {
    this.model = model;
  }
  
  /**
   * Set case context for more relevant responses
   * @param caseDetails Case details as text
   */
  setCaseContext(caseDetails: string | null) {
    this.caseContext = caseDetails;
  }
  
  /**
   * Generate a response to a legal question using Ollama
   * @param message User's message/question
   * @returns AI response
   */
  async getResponse(message: string): Promise<string> {
    try {
      // Prepare prompt with context if available
      let prompt = message;
      
      if (this.caseContext) {
        prompt = `[Case Context]\n${this.caseContext}\n\n[Question]\n${message}\n\n[Answer as a judge]`;
      } else {
        prompt = `[Question]\n${message}\n\n[Answer as a legal expert]`;
      }
      
      // Add system prompt for law expertise
      const systemPrompt = "You are a virtual judge from the Delhi High Court with expertise in Indian law. Provide clear, professional legal analysis and guidance. Base your answers on legal principles, precedents, and statutes. Always maintain judicial dignity and impartiality.";
      
      // Try to connect to Ollama API
      const response = await fetch(`${OLLAMA_API_ENDPOINT}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          system: systemPrompt,
          stream: false
        }),
      });
      
      if (!response.ok) {
        // Fallback to rule-based response if Ollama isn't available
        console.error(`Ollama API error: ${response.status} ${response.statusText}`);
        return this.getFallbackResponse(message);
      }
      
      const data = await response.json() as any;
      return data.response || this.getFallbackResponse(message);
      
    } catch (error) {
      console.error('Error connecting to Ollama:', error);
      // Fallback to rule-based response if Ollama isn't available
      return this.getFallbackResponse(message);
    }
  }
  
  /**
   * Generate a rule-based response when AI is unavailable
   * @param message User's message/question
   * @returns Rule-based response
   */
  private getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Legal procedure related queries
    if (lowerMessage.includes('procedure') || lowerMessage.includes('file') || lowerMessage.includes('submit')) {
      return 'To proceed with your case, you need to file the appropriate documents with the court registry. Ensure all supporting evidence and affidavits are properly annexed. The court follows strict procedural rules that must be adhered to for your petition to be considered.';
    }
    
    // Rights related queries
    if (lowerMessage.includes('right') || lowerMessage.includes('entitled') || lowerMessage.includes('allow')) {
      return 'Legal rights must be exercised within the framework of existing laws. The court evaluates rights claims against constitutional provisions, statutory law, and binding precedents. Each case is unique and requires specific analysis of applicable legal principles.';
    }
    
    // Evidence related queries
    if (lowerMessage.includes('evidence') || lowerMessage.includes('proof') || lowerMessage.includes('document')) {
      return 'Evidence must meet admissibility standards set by the Indian Evidence Act. Documentary evidence should be properly authenticated, and witness testimonies should be backed by affidavits. The court weighs evidence based on relevance, materiality, and probative value.';
    }
    
    // Appeal related queries
    if (lowerMessage.includes('appeal') || lowerMessage.includes('challenge') || lowerMessage.includes('review')) {
      return 'Appeals must be filed within the prescribed limitation period. The grounds for appeal should clearly identify errors in the lower court judgment. New evidence is generally not admissible at the appellate stage unless exceptional circumstances exist.';
    }
    
    // Default response for other queries
    return 'As per established legal principles, each case must be evaluated on its specific facts and applicable law. The Delhi High Court follows precedent while also considering the evolving nature of jurisprudence. Legal matters require comprehensive analysis of statutory provisions, case law, and constitutional principles.';
  }
  
  /**
   * Generate a case analysis summary using AI
   * @param caseText Full text of the case
   * @returns Analysis summary
   */
  async analyzeCaseSummary(caseText: string): Promise<string> {
    try {
      const prompt = `Please analyze the following legal case and provide a concise summary highlighting the key issues, legal principles involved, and potential outcomes:\n\n${caseText.substring(0, 4000)}...`;
      
      const systemPrompt = "You are a judicial expert tasked with creating clear, professional legal summaries. Focus on identifying key legal issues, relevant statutes and precedents, and providing objective analysis.";
      
      const response = await fetch(`${OLLAMA_API_ENDPOINT}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          system: systemPrompt,
          stream: false
        }),
      });
      
      if (!response.ok) {
        console.error(`Ollama API error: ${response.status} ${response.statusText}`);
        return "The case appears to involve multiple legal questions that require careful analysis. Based on legal principles and precedents, the court will evaluate the merits while considering procedural compliance and substantive law.";
      }
      
      const data = await response.json() as any;
      return data.response || "The case requires thorough examination of facts and applicable legal provisions. The court's decision will depend on the strength of arguments presented by both parties and relevant precedents.";
      
    } catch (error) {
      console.error('Error analyzing case with Ollama:', error);
      return "This case raises important legal questions that must be evaluated within the framework of existing statutes and judicial precedents. The outcome will likely depend on specific factual circumstances and the application of established legal principles.";
    }
  }
}

// Singleton instance for use throughout the application
export const virtualJudge = new VirtualJudge();
