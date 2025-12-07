import { DifficultyConfig } from '../types';

export const DIFFICULTY_CONFIGS: Record<string, DifficultyConfig> = {
  C1: {
    addSub: {
      minValue: 1,
      maxValue: 99,
      minOperands: 2,
      maxOperands: 4,
    },
    mult: {
      minMultiplier: 2,
      maxMultiplier: 12,
      minMultiplicand: 2,
      maxMultiplicand: 20,
    },
    extras: {
      minDivisor: 2,
      maxDivisor: 9,
      minQuotient: 1,
      maxQuotient: 10,
      // Simple multiplication for C1 (up to 9th table, up to x10)
      minMultiplier: 1,
      maxMultiplier: 9,
      minMultiplicand: 1,
      maxMultiplicand: 10,
    },
  },
  C2: {
    addSub: {
      minValue: 10,
      maxValue: 999,
      minOperands: 3,
      maxOperands: 5,
    },
    mult: {
      minMultiplier: 5,
      maxMultiplier: 20,
      minMultiplicand: 5,
      maxMultiplicand: 50,
    },
    extras: {
      minDivisor: 2,
      maxDivisor: 20,
      minQuotient: 5,
      maxQuotient: 25,
    },
  },
  C3: {
    addSub: {
      minValue: 100,
      maxValue: 9999,
      minOperands: 3,
      maxOperands: 6,
    },
    mult: {
      minMultiplier: 10,
      maxMultiplier: 50,
      minMultiplicand: 10,
      maxMultiplicand: 100,
    },
    extras: {
      minDivisor: 5,
      maxDivisor: 25,
      minQuotient: 10,
      maxQuotient: 50,
    },
  },
};

export const DEFAULT_QUESTIONS_PER_SECTION = 20;
export const SECTIONS_CONFIG = [
  { type: 'addition_subtraction' as const, name: 'Additions And Subtractions' },
  { type: 'multiplication' as const, name: 'Multiplications' },
  { type: 'extras' as const, name: 'Extras' },
];
