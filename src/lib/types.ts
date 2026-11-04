export interface MathStep {
  stepNumber: number;
  title: string;
  expression: string;
  action: string;
  rule: string;
  isFinal?: boolean;
}

export interface SolveResult {
  success: boolean;
  type: 'calculator' | 'simplify' | 'equation';
  original: string;
  steps: MathStep[];
  finalAnswer: string;
  error?: string;
}

export interface PresetProblem {
  id: string;
  category: 'equations' | 'simplifying' | 'fractions' | 'calculator';
  label: string;
  formula: string;
  description: string;
}
