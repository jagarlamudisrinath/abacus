/**
 * Expression Parser for Alama Abacus
 *
 * Parses and evaluates mathematical expressions like "5+2-6+8"
 * The expressions from practice sheets follow a simple pattern:
 * - Contains only integers
 * - Uses + and - operators
 * - No parentheses or multiplication/division
 */

/**
 * Evaluates a mathematical expression string
 * @param expression - Expression like "5+2-6+8"
 * @returns The calculated result
 */
export function evaluateExpression(expression: string): number {
  // Remove all whitespace
  const cleaned = expression.replace(/\s/g, '');

  // Handle empty expression
  if (!cleaned) {
    return 0;
  }

  // Split by operators while keeping them
  // This regex splits on + or - but keeps the delimiter
  const tokens = cleaned.split(/(?=[+-])|(?<=[+-])/);

  let result = 0;
  let currentOperator = '+';

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    if (trimmed === '+' || trimmed === '-') {
      currentOperator = trimmed;
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num)) {
        result = currentOperator === '+' ? result + num : result - num;
      }
    }
  }

  return result;
}

/**
 * Generates an intentionally wrong answer for testing accuracy scenarios
 * @param correctAnswer - The correct answer to generate a wrong version of
 * @returns A plausible but incorrect answer as a string
 */
export function generateWrongAnswer(correctAnswer: number): string {
  // Generate a wrong answer that's somewhat plausible
  // but definitely not the correct answer
  const offsets = [-3, -2, -1, 1, 2, 3, 5, -5, 10, -10];

  // Filter out offset 0 and any that would result in the correct answer
  const validOffsets = offsets.filter(offset => offset !== 0);

  const offset = validOffsets[Math.floor(Math.random() * validOffsets.length)];
  const wrongAnswer = correctAnswer + offset;

  // Make sure we don't accidentally return the correct answer
  if (wrongAnswer === correctAnswer) {
    return String(correctAnswer + 1);
  }

  return String(wrongAnswer);
}

/**
 * Validates if an expression string is in the expected format
 * @param expression - The expression to validate
 * @returns true if valid, false otherwise
 */
export function isValidExpression(expression: string): boolean {
  // Remove whitespace
  const cleaned = expression.replace(/\s/g, '');

  // Check if it matches expected pattern: numbers separated by + or -
  // Pattern: optional sign, number, then zero or more (operator, number)
  const pattern = /^-?\d+([+-]\d+)*$/;
  return pattern.test(cleaned);
}
