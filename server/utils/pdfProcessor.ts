import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { createHash } from 'crypto';

/**
 * Extract text from a PDF file using pdf-parse.
 * @param filePath Path to the PDF file
 * @returns Extracted text as a string
 */
export async function extractTextFromPdf(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const text = data.text || '';
    
    // Clean up the text (remove excess whitespace, etc.)
    return cleanExtractedText(text);
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

/**
 * Clean extracted text by normalizing whitespace and removing special characters.
 * @param text Raw extracted text
 * @returns Cleaned text
 */
function cleanExtractedText(text: string): string {
  if (!text) return '';
  
  // Replace multiple whitespace with single space
  let cleaned = text.replace(/\s+/g, ' ');
  
  // Remove special characters that might cause issues
  cleaned = cleaned.replace(/[\u0000-\u001F]/g, '');
  
  // Remove repeated line breaks
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
}

/**
 * Extract metadata from PDF text like case number, court, date, etc.
 * @param text Extracted text from PDF
 * @returns Object with metadata fields
 */
export function extractMetadata(text: string): any {
  // Extract common patterns for legal documents
  const metadata: any = {
    title: extractTitle(text),
    case_number: extractCaseNumber(text),
    date: extractDate(text),
    court: extractCourt(text),
    judges: extractJudges(text),
    petitioner: extractPetitioner(text),
    respondent: extractRespondent(text),
    type: extractCaseType(text)
  };
  
  return metadata;
}

/**
 * Extract the title of the case from text.
 * @param text Document text
 * @returns Title string or default
 */
function extractTitle(text: string): string {
  // Try to find common title patterns like "X v. Y" or "In the matter of..."
  const titleMatch = text.match(/([\w\s]+)\s+v\.?\s+([\w\s]+)/i) || 
                    text.match(/In the matter of ([\w\s]+)/i);
  
  if (titleMatch) {
    return titleMatch[0].trim();
  }
  
  // Fallback to first line if it looks like a title
  const firstLine = text.split('\n')[0];
  if (firstLine && firstLine.length > 10 && firstLine.length < 100) {
    return firstLine.trim();
  }
  
  return 'Untitled Case';
}

/**
 * Extract case number from text.
 * @param text Document text
 * @returns Case number string or null
 */
function extractCaseNumber(text: string): string | null {
  // Common case number patterns in Indian courts
  const patterns = [
    /Case\s+No\.?\s*([\w\d\.\/\-]+)/i,
    /Petition\s+No\.?\s*([\w\d\.\/\-]+)/i,
    /Appeal\s+No\.?\s*([\w\d\.\/\-]+)/i,
    /Writ\s+Petition\s+\(Civil\)\s+No\.?\s*([\w\d\.\/\-]+)/i,
    /SLP\s*\(Crl\.\)\s+No\.?\s*([\w\d\.\/\-]+)/i,
    /CRL\.?A\.?P?\s*\.?\s*([\w\d\.\/\-]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

/**
 * Extract date from text.
 * @param text Document text
 * @returns Date string or null
 */
function extractDate(text: string): string | null {
  // Date patterns with formats like DD.MM.YYYY, DD/MM/YYYY, etc.
  const datePatterns = [
    /Date\s*:\s*(\d{1,2}[\.\/\-]\d{1,2}[\.\/\-]\d{2,4})/i,
    /Dated\s*:\s*(\d{1,2}[\.\/\-]\d{1,2}[\.\/\-]\d{2,4})/i,
    /Dated this (\d{1,2})(?:st|nd|rd|th)? day of ([A-Za-z]+),?\s*(\d{4})/i,
    /(\d{1,2})(?:st|nd|rd|th)? ([A-Za-z]+),?\s*(\d{4})/i
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[1] && match[2] && match[3]) {
        // Format "1st day of January, 2021"
        return `${match[1]} ${match[2]} ${match[3]}`;
      } else if (match[1]) {
        // Format "DD/MM/YYYY"
        return match[1];
      }
    }
  }
  
  return null;
}

/**
 * Extract court name from text.
 * @param text Document text
 * @returns Court string or default
 */
function extractCourt(text: string): string {
  // Common court names
  const courtPatterns = [
    /Supreme Court of India/i,
    /Delhi High Court/i,
    /High Court of Delhi/i,
    /High Court of ([A-Za-z\s]+)/i,
    /District Court/i
  ];
  
  for (const pattern of courtPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  
  return 'Delhi High Court'; // Default for our application
}

/**
 * Extract judges from text.
 * @param text Document text
 * @returns Array of judge names or empty array
 */
function extractJudges(text: string): string[] {
  // Pattern for "Justice X" or "Hon'ble Justice X"
  const judgePatterns = [
    /Hon'ble Justice ([A-Za-z\s\.]+)/gi,
    /Justice ([A-Za-z\s\.]+)/gi
  ];
  
  const judges = new Set<string>();
  
  for (const pattern of judgePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1]) {
        judges.add(match[1].trim());
      }
    }
  }
  
  return Array.from(judges);
}

/**
 * Extract petitioner from text.
 * @param text Document text
 * @returns Petitioner string or default
 */
function extractPetitioner(text: string): string {
  // Patterns for petitioner identification
  const patterns = [
    /Petitioner:\s*([^\n]+)/i,
    /Appellant:\s*([^\n]+)/i,
    /Plaintiff:\s*([^\n]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return 'Appellant'; // Default
}

/**
 * Extract respondent from text.
 * @param text Document text
 * @returns Respondent string or default
 */
function extractRespondent(text: string): string {
  // Patterns for respondent identification
  const patterns = [
    /Respondent:\s*([^\n]+)/i,
    /Defendant:\s*([^\n]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return 'State'; // Default
}

/**
 * Extract case type from text.
 * @param text Document text
 * @returns Case type string or default
 */
function extractCaseType(text: string): string {
  // Patterns for case type
  const caseTypePatterns = [
    /Civil Appeal/i,
    /Criminal Appeal/i,
    /Special Leave Petition/i,
    /Writ Petition/i,
    /Review Petition/i
  ];
  
  for (const pattern of caseTypePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  
  return 'General Case'; // Default
}

/**
 * Calculate a document ID based on content hash
 * @param text Document text
 * @returns Hash string
 */
export function generateDocumentId(text: string): string {
  const hash = createHash('sha256');
  hash.update(text);
  return hash.digest('hex').substring(0, 16); // 16 chars is enough for our purposes
}
