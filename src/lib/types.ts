export interface MathStep {
  stepNumber: number;
  title: string;
  expression: string;
  action: string;
  rule: string;
  isFinal?: boolean;
}

export interface SolutionPath {
  id: string;
  strategyLabel: string;
  steps: MathStep[];
  finalAnswer: string;
}

export interface SolveResult {
  success: boolean;
  type: 'calculator' | 'simplify' | 'equation';
  original: string;
  steps: MathStep[];
  finalAnswer: string;
  error?: string;
  paths?: SolutionPath[];
  activePathId?: string;
  strategyLabel?: string;
}

export interface PresetProblem {
  id: string;
  category: 'equations' | 'simplifying' | 'fractions' | 'calculator' | 'factoring' | 'evaluation';
  label: string;
  formula: string;
  description: string;
  variables?: Record<string, string>;
}
