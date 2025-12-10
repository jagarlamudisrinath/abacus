import fetch from 'node-fetch';

const FORMS = [
  { id: 'aa-2', name: 'AA Practice Sheet 2', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfoiYMAfZXJM3TLM21WtXqO8rka6-CesA9T3aDVqUgJYN0VCg/viewform' },
  { id: 'aa-3', name: 'AA Practice Sheet 3', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfUrCREagahmDpjdPL4qyeNUjbHfUZpH85IU2ShHa3pg_KC8A/viewform' },
  { id: 'aa-7', name: 'AA Practice Sheet 7', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfbR0K4-hfUztDVNF8fbJPZ9NW3j-2-sk-miqwyNFOSEppV5A/viewform' },
  { id: 'aa-9', name: 'AA Practice Sheet 9', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdXvEwdNsrC17cpxXq65h9KTV4CDrHXlruG-GDcPnGjZ8TcWQ/viewform' },
  { id: 'aa-10', name: 'AA Practice Sheet 10', url: 'https://docs.google.com/forms/d/e/1FAIpQLSewg0HWPJzS2tQkDCP3ok_Gaig6AxNlCGM0n1bGyuxaexbdaw/viewform' },
  { id: 'aa2-5', name: 'AA2 Practice Sheet 5', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfK3zwdTfY76TIxewrNMODRlPuaZwsI7UtLZRwiDkL0c2cQqQ/viewform' },
  { id: 'aa2-6', name: 'AA2 Practice Sheet 6', url: 'https://docs.google.com/forms/d/e/1FAIpQLSeLjXJ1mgQtHaH1WMw3sOMi8rBVCW-t-_AAGRNT8KOjKc6bFA/viewform' },
  { id: 'aa2-8', name: 'AA2 Practice Sheet 8', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdZzZjgub-4oajbCGZfTvq0MGb5BUCNU8Mmku1_tYiNoansCA/viewform' },
];

async function scrapeForm(url: string): Promise<string[]> {
  const response = await fetch(url);
  const html = await response.text();

  // Google Forms stores question data in a specific format within the HTML
  // Look for patterns like data-params or FB_PUBLIC_LOAD_DATA_
  const questions: string[] = [];

  // Try multiple patterns to extract questions
  // Pattern 1: data-params format
  const dataParamsRegex = /data-params="[^"]*?\[\[(\d+),"([^"]+)"/g;
  let match;
  while ((match = dataParamsRegex.exec(html)) !== null) {
    const text = match[2];
    // Check if it's a math expression (contains digits and operators)
    if (/[\d]/.test(text) && /[+\-]/.test(text)) {
      const cleaned = text.replace(/\s*=\s*$/, '').trim();
      if (cleaned && !questions.includes(cleaned)) {
        questions.push(cleaned);
      }
    }
  }

  // Pattern 2: FB_PUBLIC_LOAD_DATA_ JSON format
  const fbDataMatch = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]*?\]);/);
  if (fbDataMatch) {
    try {
      const data = JSON.parse(fbDataMatch[1]);
      extractQuestionsFromFbData(data, questions);
    } catch (e) {
      console.error('Failed to parse FB_PUBLIC_LOAD_DATA_');
    }
  }

  // Pattern 3: Look for question text in specific format
  const questionRegex = /\["([^"]*?)"\s*,\s*(?:null|"[^"]*?")\s*,\s*(?:0|1)\s*,/g;
  while ((match = questionRegex.exec(html)) !== null) {
    const text = match[1];
    if (/[\d]/.test(text) && /[+\-]/.test(text) && text.length < 50) {
      const cleaned = text.replace(/\s*=\s*$/, '').trim();
      if (cleaned && !questions.includes(cleaned)) {
        questions.push(cleaned);
      }
    }
  }

  return questions;
}

function extractQuestionsFromFbData(data: any, questions: string[]): void {
  if (!Array.isArray(data)) return;

  for (const item of data) {
    if (typeof item === 'string' && /[\d]/.test(item) && /[+\-]/.test(item) && item.length < 50) {
      const cleaned = item.replace(/\s*=\s*$/, '').trim();
      if (cleaned && !questions.includes(cleaned)) {
        questions.push(cleaned);
      }
    } else if (Array.isArray(item)) {
      extractQuestionsFromFbData(item, questions);
    }
  }
}

function cleanExpression(expr: string): string {
  // Remove question numbering like "1.) ", "1. ", "1)", etc.
  let cleaned = expr
    .replace(/^\d+\.\)\s*/g, '')  // "1.) "
    .replace(/^\d+\.\s*/g, '')    // "1. "
    .replace(/^\d+\)\s*/g, '')    // "1) "
    .replace(/<div>.*<\/div>/g, '') // Remove HTML divs
    .replace(/<br\/?>/g, '')      // Remove line breaks
    .replace(/\s+/g, '')          // Remove all whitespace
    .trim();

  return cleaned;
}

function evaluateExpression(expr: string): number {
  // Clean the expression first
  let cleaned = cleanExpression(expr);

  // Normalize the expression
  let normalized = cleaned
    .replace(/−/g, '-')  // Unicode minus to standard minus
    .replace(/×/g, '*')  // Multiplication sign
    .replace(/÷/g, '/'); // Division sign

  // Only allow safe characters
  if (!/^[\d+\-*/().]+$/.test(normalized)) {
    throw new Error(`Invalid expression: ${expr}`);
  }

  // Evaluate using Function (safe for math expressions)
  return Function('"use strict"; return (' + normalized + ')')();
}

async function main() {
  const practiceSheets: {
    id: string;
    name: string;
    questions: { expression: string; answer: number }[];
  }[] = [];

  for (const form of FORMS) {
    console.error(`Scraping ${form.name}...`);
    try {
      const expressions = await scrapeForm(form.url);
      console.error(`  Found ${expressions.length} raw expressions`);

      const questions: { expression: string; answer: number }[] = [];
      for (const expr of expressions) {
        try {
          const cleanedExpr = cleanExpression(expr);
          const answer = evaluateExpression(expr);
          // Only add if not already in the list (avoid duplicates)
          if (!questions.some(q => q.expression === cleanedExpr)) {
            questions.push({ expression: cleanedExpr, answer });
          }
        } catch (e) {
          // Only log if it's not just a numbering issue
          if (!expr.match(/^(\d+\.|\d+\))/)) {
            console.error(`  Failed to evaluate: ${expr}`);
          }
        }
      }

      practiceSheets.push({
        id: form.id,
        name: form.name,
        questions
      });
      console.error(`  Successfully processed ${questions.length} questions`);
    } catch (e) {
      console.error(`  Error scraping form: ${e}`);
      practiceSheets.push({
        id: form.id,
        name: form.name,
        questions: []
      });
    }
  }

  // Output TypeScript file
  const output = `export interface PracticeSheet {
  id: string;
  name: string;
  questions: { expression: string; answer: number }[];
}

export const PRACTICE_SHEETS: PracticeSheet[] = ${JSON.stringify(practiceSheets, null, 2)};

export function getPracticeSheetById(id: string): PracticeSheet | undefined {
  return PRACTICE_SHEETS.find(sheet => sheet.id === id);
}

export function getAllPracticeSheets(): { id: string; name: string; questionCount: number }[] {
  return PRACTICE_SHEETS.map(sheet => ({
    id: sheet.id,
    name: sheet.name,
    questionCount: sheet.questions.length
  }));
}
`;
  console.log(output);
}

main().catch(console.error);
