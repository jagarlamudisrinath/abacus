import { Question, SectionType, DifficultyConfig } from '../types';
import { DIFFICULTY_CONFIGS, DEFAULT_QUESTIONS_PER_SECTION } from '../config/difficultyLevels';
import { v4 as uuidv4 } from 'uuid';

// Utility function to generate random integer between min and max (inclusive)
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate Addition/Subtraction question
function generateAddSubQuestion(config: DifficultyConfig['addSub']): { expression: string; answer: number } {
  const operandCount = randomInt(config.minOperands, config.maxOperands);
  const operands: number[] = [];
  const operators: ('+' | '-')[] = [];

  // Generate first operand
  operands.push(randomInt(config.minValue, config.maxValue));

  // Generate remaining operands and operators
  for (let i = 1; i < operandCount; i++) {
    operands.push(randomInt(config.minValue, config.maxValue));
    operators.push(Math.random() > 0.5 ? '+' : '-');
  }

  // Calculate answer
  let answer = operands[0];
  for (let i = 1; i < operands.length; i++) {
    answer = operators[i - 1] === '+' ? answer + operands[i] : answer - operands[i];
  }

  // Build expression string
  let expression = operands[0].toString();
  for (let i = 1; i < operands.length; i++) {
    expression += operators[i - 1] + operands[i];
  }

  return { expression, answer };
}

// Generate Multiplication question
function generateMultQuestion(config: DifficultyConfig['mult']): { expression: string; answer: number } {
  const a = randomInt(config.minMultiplier, config.maxMultiplier);
  const b = randomInt(config.minMultiplicand, config.maxMultiplicand);

  return {
    expression: `${a}x${b}`,
    answer: a * b,
  };
}

// Generate Extras question (division, multiplication, or mixed based on difficulty)
function generateExtrasQuestion(config: DifficultyConfig['extras'], difficulty: string): { expression: string; answer: number } {
  // For C1: Only simple multiplication or division (no mixed operations)
  if (difficulty === 'C1') {
    const questionType = randomInt(1, 2);

    if (questionType === 1) {
      // Division (no remainder)
      const divisor = randomInt(config.minDivisor, config.maxDivisor);
      const quotient = randomInt(config.minQuotient, config.maxQuotient);
      const dividend = divisor * quotient;

      return {
        expression: `${dividend}/${divisor}`,
        answer: quotient,
      };
    } else {
      // Simple multiplication (up to 9th table, up to x10)
      const a = randomInt(config.minMultiplier || 1, config.maxMultiplier || 9);
      const b = randomInt(config.minMultiplicand || 1, config.maxMultiplicand || 10);

      return {
        expression: `${a}x${b}`,
        answer: a * b,
      };
    }
  }

  // For C2 and C3: Keep existing mixed operations behavior
  const questionType = randomInt(1, 3);

  if (questionType === 1) {
    // Division (no remainder)
    const divisor = randomInt(config.minDivisor, config.maxDivisor);
    const quotient = randomInt(config.minQuotient, config.maxQuotient);
    const dividend = divisor * quotient;

    return {
      expression: `${dividend}/${divisor}`,
      answer: quotient,
    };
  } else if (questionType === 2) {
    // Mixed: a + b x c (multiplication first)
    const a = randomInt(10, 50);
    const b = randomInt(2, 10);
    const c = randomInt(2, 10);
    const answer = a + b * c;

    return {
      expression: `${a}+${b}x${c}`,
      answer,
    };
  } else {
    // Mixed: a x b - c
    const a = randomInt(5, 15);
    const b = randomInt(5, 15);
    const c = randomInt(10, 50);
    const answer = a * b - c;

    return {
      expression: `${a}x${b}-${c}`,
      answer,
    };
  }
}

// Generate a single question based on section type
export function generateQuestion(
  sectionType: SectionType,
  difficulty: string,
  sectionId: string,
  questionNumber: number
): Question {
  const config = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS['C1'];
  let result: { expression: string; answer: number };

  switch (sectionType) {
    case 'addition_subtraction':
      result = generateAddSubQuestion(config.addSub);
      break;
    case 'multiplication':
      result = generateMultQuestion(config.mult);
      break;
    case 'extras':
      result = generateExtrasQuestion(config.extras, difficulty);
      break;
    default:
      result = generateAddSubQuestion(config.addSub);
  }

  return {
    id: uuidv4(),
    sectionId,
    questionNumber,
    expression: result.expression,
    correctAnswer: result.answer,
    isBookmarked: false,
  };
}

// Generate all questions for a section
export function generateSectionQuestions(
  sectionType: SectionType,
  sectionId: string,
  difficulty: string,
  count: number,
  startingNumber: number
): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < count; i++) {
    questions.push(
      generateQuestion(sectionType, difficulty, sectionId, startingNumber + i)
    );
  }

  return questions;
}
