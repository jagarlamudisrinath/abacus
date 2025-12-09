/**
 * Google Forms Scraper
 * Extracts math expressions from Google Forms and auto-calculates answers.
 */

export interface ParsedQuestion {
  expression: string;
  answer: number;
}

/**
 * Scrapes a Google Form URL and returns parsed questions with calculated answers
 */
export async function scrapeGoogleForm(url: string): Promise<ParsedQuestion[]> {
  // Validate URL format
  if (!url.includes('docs.google.com/forms')) {
    throw new Error('Invalid Google Forms URL');
  }

  // Fetch the form HTML
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch form: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const rawExpressions = extractExpressionsFromHtml(html);

  if (rawExpressions.length === 0) {
    throw new Error('No math expressions found in the form');
  }

  // Process and evaluate each expression
  const questions: ParsedQuestion[] = [];
  for (const expr of rawExpressions) {
    try {
      const cleaned = cleanExpression(expr);
      if (!cleaned) continue;

      const answer = evaluateExpression(cleaned);
      // Avoid duplicates
      if (!questions.some(q => q.expression === cleaned)) {
        questions.push({ expression: cleaned, answer });
      }
    } catch {
      // Skip invalid expressions silently
    }
  }

  return questions;
}

/**
 * Extracts math expressions from Google Form HTML
 */
function extractExpressionsFromHtml(html: string): string[] {
  const expressions: string[] = [];

  // Pattern 1: data-params attribute format
  const dataParamsRegex = /data-params="[^"]*?\[\[(\d+),"([^"]+)"/g;
  let match;
  while ((match = dataParamsRegex.exec(html)) !== null) {
    const text = match[2];
    if (isMathExpression(text)) {
      const cleaned = text.replace(/\s*=\s*$/, '').trim();
      if (cleaned && !expressions.includes(cleaned)) {
        expressions.push(cleaned);
      }
    }
  }

  // Pattern 2: FB_PUBLIC_LOAD_DATA_ JSON format
  const fbDataMatch = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]*?\]);/);
  if (fbDataMatch) {
    try {
      const data = JSON.parse(fbDataMatch[1]);
      extractQuestionsFromFbData(data, expressions);
    } catch {
      // Ignore JSON parse errors
    }
  }

  // Pattern 3: Question text pattern
  const questionRegex = /\["([^"]*?)"\s*,\s*(?:null|"[^"]*?")\s*,\s*(?:0|1)\s*,/g;
  while ((match = questionRegex.exec(html)) !== null) {
    const text = match[1];
    if (isMathExpression(text) && text.length < 50) {
      const cleaned = text.replace(/\s*=\s*$/, '').trim();
      if (cleaned && !expressions.includes(cleaned)) {
        expressions.push(cleaned);
      }
    }
  }

  return expressions;
}

/**
 * Recursively extracts questions from FB_PUBLIC_LOAD_DATA_ JSON
 */
function extractQuestionsFromFbData(data: unknown, expressions: string[]): void {
  if (!Array.isArray(data)) return;

  for (const item of data) {
    if (typeof item === 'string' && isMathExpression(item) && item.length < 50) {
      const cleaned = item.replace(/\s*=\s*$/, '').trim();
      if (cleaned && !expressions.includes(cleaned)) {
        expressions.push(cleaned);
      }
    } else if (Array.isArray(item)) {
      extractQuestionsFromFbData(item, expressions);
    }
  }
}

/**
 * Checks if a string looks like a math expression
 */
function isMathExpression(text: string): boolean {
  return /[\d]/.test(text) && /[+\-]/.test(text);
}

/**
 * Cleans expression by removing numbering, HTML, and normalizing
 */
function cleanExpression(expr: string): string {
  return expr
    .replace(/^\d+\.\)\s*/g, '')  // "1.) "
    .replace(/^\d+\.\s*/g, '')    // "1. "
    .replace(/^\d+\)\s*/g, '')    // "1) "
    .replace(/<div>.*<\/div>/g, '') // Remove HTML divs
    .replace(/<br\/?>/g, '')      // Remove line breaks
    .replace(/\s+/g, '')          // Remove all whitespace
    .trim();
}

/**
 * Safely evaluates a math expression
 * Only allows digits and basic arithmetic operators
 */
export function evaluateExpression(expr: string): number {
  // Normalize the expression
  const normalized = expr
    .replace(/−/g, '-')  // Unicode minus to standard minus
    .replace(/×/g, '*')  // Multiplication sign
    .replace(/÷/g, '/'); // Division sign

  // Validate - only allow safe characters
  if (!/^[\d+\-*/().]+$/.test(normalized)) {
    throw new Error(`Invalid expression: ${expr}`);
  }

  // Safe evaluation using Function (avoids direct eval)
  return Function('"use strict"; return (' + normalized + ')')() as number;
}
