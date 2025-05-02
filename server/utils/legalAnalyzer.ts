import fs from 'fs';
import path from 'path';
import { extractMetadata, generateDocumentId } from './pdfProcessor';

// Collection of sample precedent cases from the Delhi High Court
const precedentCases = [
  {
    title: "State vs John Doe",
    citation: "(2022) DLT 123",
    summary: "This case involved similar legal principles regarding criminal procedure.",
    year: 2022,
    outcome: "Appeal Allowed"
  },
  {
    title: "Jane Doe vs State",
    citation: "(2021) DLT 456",
    summary: "This case set precedent for similar factual scenarios.",
    year: 2021,
    outcome: "Appeal Dismissed"
  },
  {
    title: "Legal Authority vs Respondent",
    citation: "(2019) DLT 789",
    summary: "This case established the standard for reviewing similar legal questions.",
    year: 2019,
    outcome: "Appeal Partially Allowed"
  },
  {
    title: "Delhi Development Authority vs XYZ",
    citation: "(2020) DLT 234",
    summary: "This case dealt with property disputes and compensation.",
    year: 2020,
    outcome: "Appeal Allowed"
  },
  {
    title: "ABC Corporation vs Delhi Municipal Corporation",
    citation: "(2023) DLT 567",
    summary: "This case involved taxation and regulatory compliance issues.",
    year: 2023,
    outcome: "Appeal Dismissed"
  }
];

// Legal terms and principles to extract from documents
const legalPrinciples = [
  "Burden of proof",
  "Due process",
  "Natural justice",
  "Doctrine of precedent",
  "Legitimate expectation",
  "Ultra vires",
  "Reasonable classification",
  "Proportionality",
  "Separation of powers",
  "Judicial review"
];

/**
 * Find similar cases based on document text
 * @param documentText Extracted text from document
 * @param metadata Document metadata
 * @returns Array of similar cases with similarity score
 */
export function findSimilarCases(documentText: string, metadata: any): any[] {
  // In a real-world scenario, this would use vector embeddings or ML
  // For this prototype, we'll use a simple keyword matching approach
  
  const keywords = extractKeywords(documentText);
  const caseType = metadata.type || 'General Case';
  
  // Filter and score precedent cases
  return precedentCases
    .map(precedent => {
      // Calculate similarity score based on shared keywords and case type
      const titleWords = extractKeywords(precedent.title + ' ' + precedent.summary);
      const sharedWords = keywords.filter(word => titleWords.includes(word));
      const typeMatch = precedent.title.toLowerCase().includes(caseType.toLowerCase()) ? 0.2 : 0;
      
      // Calculate similarity score (0.0 to 1.0)
      const similarity = Math.min(
        (sharedWords.length / Math.max(keywords.length, 1)) + typeMatch, 
        0.95 // Cap similarity at 95%
      );
      
      return {
        ...precedent,
        similarity: parseFloat(similarity.toFixed(2))
      };
    })
    .filter(precedent => precedent.similarity > 0.3) // Only keep somewhat relevant cases
    .sort((a, b) => b.similarity - a.similarity) // Sort by highest similarity
    .slice(0, 3); // Take top 3 most similar cases
}

/**
 * Predict judgment outcome based on document and similar cases
 * @param documentText Extracted document text
 * @param similarCases Array of similar cases
 * @returns Prediction object with outcome, confidence, etc.
 */
export function predictJudgment(documentText: string, similarCases: any[]): any {
  // Since we don't have a real ML model here, we'll use a heuristic approach
  // based on similar cases and document content
  
  if (!similarCases || similarCases.length === 0) {
    return {
      plaintiffOutcome: 50,
      defendantOutcome: 50,
      basis: "Insufficient precedent cases to make a prediction",
      explanation: "Without similar cases, the outcome is uncertain",
      confidence: 30
    };
  }
  
  // Look at outcomes of similar cases to generate prediction
  const allowedCount = similarCases.filter(c => 
    c.outcome.toLowerCase().includes('allow')
  ).length;
  
  const dismissedCount = similarCases.length - allowedCount;
  const totalWeight = similarCases.reduce((sum, c) => sum + c.similarity, 0);
  
  // Weight the outcomes by similarity scores
  const allowedWeight = similarCases
    .filter(c => c.outcome.toLowerCase().includes('allow'))
    .reduce((sum, c) => sum + c.similarity, 0);
  
  // Calculate plaintiff favorable outcome percentage
  const plaintiffFavorable = Math.round((allowedWeight / totalWeight) * 100);
  
  // Generate confidence based on similarity scores
  const avgSimilarity = totalWeight / similarCases.length;
  const confidence = Math.round(avgSimilarity * 100);
  
  // Generate explanation
  let basis = "Prediction based on similar Delhi High Court cases";
  let explanation = "";
  
  if (plaintiffFavorable > 60) {
    explanation = `Analysis of ${similarCases.length} similar cases shows a ${plaintiffFavorable}% likelihood of favorable outcome for the plaintiff/appellant, based on precedent.`;
  } else if (plaintiffFavorable < 40) {
    explanation = `Analysis of ${similarCases.length} similar cases shows a ${100-plaintiffFavorable}% likelihood of favorable outcome for the defendant/respondent, based on precedent.`;
  } else {
    explanation = `Analysis of ${similarCases.length} similar cases shows a relatively balanced outcome probability. The case could go either way.`;
  }
  
  return {
    plaintiffOutcome: plaintiffFavorable,
    defendantOutcome: 100 - plaintiffFavorable,
    basis: basis,
    explanation: explanation,
    confidence: confidence
  };
}

/**
 * Extract legal principles from document text
 * @param documentText Document text
 * @returns Array of legal principles found in the text
 */
export function extractLegalPrinciples(documentText: string): string[] {
  return legalPrinciples.filter(principle => 
    documentText.toLowerCase().includes(principle.toLowerCase())
  );
}

/**
 * Analyze arguments' strengths and weaknesses
 * @param documentText Document text
 * @param metadata Document metadata
 * @returns Object with strengths and weaknesses arrays
 */
export function analyzeArguments(documentText: string, metadata: any): any {
  // In a real system, this would use NLP or ML to identify arguments
  // For this prototype, we'll use a heuristic approach
  
  const strengths = [];
  const weaknesses = [];
  
  // Check for common phrases indicating strong arguments
  if (documentText.match(/evidence clearly shows|strong precedent|well established|consistently held/i)) {
    strengths.push("Strong documentary evidence supports the case");
  }
  
  if (documentText.match(/supreme court has ruled|constitution provides|fundamental right/i)) {
    strengths.push("Constitutional or Supreme Court precedent supports position");
  }
  
  if (documentText.match(/statute explicitly|legislative intent|plain meaning/i)) {
    strengths.push("Clear statutory language supports the interpretation");
  }
  
  // Check for common phrases indicating weaknesses
  if (documentText.match(/lack of evidence|insufficient proof|failed to demonstrate/i)) {
    weaknesses.push("Insufficient evidence to fully support claims");
  }
  
  if (documentText.match(/contrary to precedent|distinguishable from|overturned/i)) {
    weaknesses.push("Some cited precedents may be distinguishable from current case");
  }
  
  if (documentText.match(/procedural error|time barred|limitation|jurisdiction/i)) {
    weaknesses.push("Potential procedural or jurisdictional issues may affect outcome");
  }
  
  // Add default strengths/weaknesses if none found
  if (strengths.length === 0) {
    strengths.push("Case presents a reasonable interpretation of the law");
    strengths.push("Arguments follow logical structure with supporting citations");
  }
  
  if (weaknesses.length === 0) {
    weaknesses.push("Further documentation may strengthen certain arguments");
    weaknesses.push("Additional precedent cases could bolster legal position");
  }
  
  return { strengths, weaknesses };
}

/**
 * Extract keywords from text for similarity matching
 * @param text Input text
 * @returns Array of keywords
 */
function extractKeywords(text: string): string[] {
  // In a real system, this would use NLP techniques
  // For this prototype, we'll use a simple approach
  
  const stopWords = new Set([
    'the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'by', 'with',
    'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'that', 'this', 'these',
    'those', 'it', 'its', 'from', 'has', 'have', 'had', 'having', 'not', 'no'
  ]);
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split on whitespace
    .filter(word => 
      word.length > 3 && // Only words longer than 3 chars
      !stopWords.has(word) // Not a stop word
    );
}

/**
 * Generate the full document analysis
 * @param documentText Document text
 * @returns Complete analysis object
 */
export function generateFullAnalysis(documentText: string): any {
  const metadata = extractMetadata(documentText);
  const similarCases = findSimilarCases(documentText, metadata);
  const prediction = predictJudgment(documentText, similarCases);
  const legalPrinciples = extractLegalPrinciples(documentText);
  const argumentAnalysis = analyzeArguments(documentText, metadata);
  
  return {
    metadata,
    similar_cases: similarCases,
    prediction,
    legal_principles: legalPrinciples,
    analysis: argumentAnalysis,
    document_id: generateDocumentId(documentText)
  };
}
