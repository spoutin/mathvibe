import { describe, it, expect } from 'vitest';
import { validateStep } from '../src/lib/math/validator.ts';
import type { MathStep } from '../src/lib/types.ts';

describe('Mathematical Step Equivalence & Validator', () => {
  const sampleSteps: MathStep[] = [
    {
      stepNumber: 1,
      title: 'Step 1: Expand Parentheses',
      expression: '4x - 8 = 2x + 10',
      action: 'Applied distributive property',
      rule: 'Distributive Property',
    },
    {
      stepNumber: 2,
      title: 'Step 2: Subtract 2x from both sides',
      expression: '2x - 8 = 10',
      action: 'Subtracted 2x from both sides',
      rule: 'Inverse Operations',
    },
    {
      stepNumber: 3,
      title: 'Step 3: Add 8 to both sides',
      expression: '2x = 18',
      action: 'Added 8 to both sides',
      rule: 'Inverse Operations',
    },
    {
      stepNumber: 4,
      title: 'Step 4: Solve for x',
      expression: 'x = 9',
      action: 'Divided both sides by 2',
      rule: 'Division Property',
      isFinal: true,
    },
  ];

  it('validates exact match with whitespace variations', () => {
    const res = validateStep('4x-8=2x+10', 0, sampleSteps);
    expect(res.status).toBe('correct');
    expect(res.matchedStepIndex).toBe(0);
  });

  it('validates commutative terms within equation sides (7 + 3x = 22)', () => {
    const steps: MathStep[] = [
      { stepNumber: 1, title: 'Step 1', expression: '3x + 7 = 22', action: '', rule: '' },
    ];
    const res = validateStep('7 + 3x = 22', 0, steps);
    expect(res.status).toBe('correct');
  });

  it('validates symmetric equation sides (22 = 3x + 7 and 9 = x)', () => {
    const r1 = validateStep('2x + 10 = 4x - 8', 0, sampleSteps);
    expect(r1.status).toBe('correct');

    const r2 = validateStep('9 = x', 3, sampleSteps);
    expect(r2.status).toBe('correct');
  });

  it('identifies incorrect answers', () => {
    const res = validateStep('3x + 5 = 20', 0, sampleSteps);
    expect(res.status).toBe('incorrect');
    expect(res.message).toBeDefined();
  });

  it('identifies skipped steps when student does mental math forward', () => {
    // Current index is 0 (Step 1: 4x - 8 = 2x + 10).
    // Student inputs "2x = 18" (which is Step 3, index 2).
    const res = validateStep('2x = 18', 0, sampleSteps);
    expect(res.status).toBe('skipped');
    expect(res.matchedStepIndex).toBe(2);
    expect(res.skippedSteps?.length).toBe(2); // Steps at index 0 and 1
    expect(res.skippedSteps?.[0].expression).toBe('4x - 8 = 2x + 10');
    expect(res.skippedSteps?.[1].expression).toBe('2x - 8 = 10');
  });

  it('validates commutative expressions without equals sign', () => {
    const steps: MathStep[] = [
      { stepNumber: 1, title: 'Step 1', expression: 'x + 8', action: '', rule: '' },
    ];
    const res = validateStep('8 + x', 0, steps);
    expect(res.status).toBe('correct');
  });

  it('validates unreduced and reduced fraction equivalence (x = 2/4 vs x = 1/2)', () => {
    const steps: MathStep[] = [
      { stepNumber: 1, title: 'Step 1', expression: 'x = 1/2', action: '', rule: '' },
    ];
    expect(validateStep('x = 2/4', 0, steps).status).toBe('correct');
    expect(validateStep('2/4 = x', 0, steps).status).toBe('correct');
  });

  it('accepts double equals (==) as single equals (=) in student step input', () => {
    const steps: MathStep[] = [
      { stepNumber: 1, title: 'Step 1', expression: '3(5) + 7 = 22', action: '', rule: '' },
    ];
    expect(validateStep('3(5) + 7 == 22', 0, steps).status).toBe('correct');
  });
});
