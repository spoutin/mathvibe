import type { PresetProblem } from './types.ts';

export const GRADE_9_PRESETS: PresetProblem[] = [
  // Linear Equations
  {
    id: 'eq-1',
    category: 'equations',
    label: '3x + 7 = 22',
    formula: '3x + 7 = 22',
    description: 'Two-step linear equation (inverse operations)',
  },
  {
    id: 'eq-2',
    category: 'equations',
    label: '4x - 8 = 2x + 10',
    formula: '4x - 8 = 2x + 10',
    description: 'Variables on both sides of the equation',
  },
  {
    id: 'eq-3',
    category: 'equations',
    label: '2(x - 3) = 14',
    formula: '2(x - 3) = 14',
    description: 'Equation with distributive brackets',
  },
  {
    id: 'eq-4',
    category: 'equations',
    label: 'x/2 + x/3 = 5',
    formula: 'x/2 + x/3 = 5',
    description: 'Clearing fractional denominators using LCD',
  },
  {
    id: 'eq-5',
    category: 'equations',
    label: '-3x + 9 = -6',
    formula: '-3x + 9 = -6',
    description: 'Negative coefficients and dividing by negatives',
  },

  // Simplifying Expressions
  {
    id: 'simp-1',
    category: 'simplifying',
    label: '4x + 7 + 2x - 3',
    formula: '4x + 7 + 2x - 3',
    description: 'Collecting like terms (variable and constants)',
  },
  {
    id: 'simp-2',
    category: 'simplifying',
    label: '3(2x - 4)',
    formula: '3(2x - 4)',
    description: 'Distributive property (expanding parentheses)',
  },
  {
    id: 'simp-3',
    category: 'simplifying',
    label: '2(3x + 4) - 5x + 7',
    formula: '2(3x + 4) - 5x + 7',
    description: 'Multi-step expansion followed by combining like terms',
  },

  // Fractions & BEDMAS
  {
    id: 'frac-1',
    category: 'fractions',
    label: '3/4 + 2/5',
    formula: '3/4 + 2/5',
    description: 'Adding fractions with different denominators',
  },
  {
    id: 'frac-2',
    category: 'fractions',
    label: '2/3 * 3/5 + 1/4',
    formula: '2/3 * 3/5 + 1/4',
    description: 'Multiplying fractions and adding result',
  },

  // Calculator & BEDMAS
  {
    id: 'calc-1',
    category: 'calculator',
    label: '(12 - 4) * 3 + 2^3',
    formula: '(12 - 4) * 3 + 2^3',
    description: 'Order of operations: Brackets, Exponents, Multiply, Add',
  },
  {
    id: 'calc-2',
    category: 'calculator',
    label: '18 / 3 + 4 * 2^2',
    formula: '18 / 3 + 4 * 2^2',
    description: 'Division, powers, and multiplication order',
  },
];
