import { describe, it, expect } from 'vitest';
import { Fraction } from '../src/lib/math/fraction.ts';

describe('Fraction utility', () => {
  it('creates and reduces fractions correctly', () => {
    const f1 = new Fraction(6, 8);
    expect(f1.numerator).toBe(3);
    expect(f1.denominator).toBe(4);
    expect(f1.toString()).toBe('3/4');
  });

  it('adds fractions with different denominators', () => {
    const f1 = new Fraction(3, 4);
    const f2 = new Fraction(2, 5);
    const result = f1.add(f2);
    expect(result.toString()).toBe('23/20');
  });

  it('subtracts fractions', () => {
    const f1 = new Fraction(3, 4);
    const f2 = new Fraction(1, 4);
    const result = f1.sub(f2);
    expect(result.toString()).toBe('1/2');
  });

  it('multiplies fractions', () => {
    const f1 = new Fraction(2, 3);
    const f2 = new Fraction(3, 5);
    const result = f1.mul(f2);
    expect(result.toString()).toBe('2/5');
  });

  it('divides fractions', () => {
    const f1 = new Fraction(2, 3);
    const f2 = new Fraction(4, 5);
    const result = f1.div(f2);
    expect(result.toString()).toBe('5/6');
  });

  it('handles division by zero', () => {
    const f1 = new Fraction(1, 2);
    const zero = new Fraction(0, 1);
    expect(() => f1.div(zero)).toThrow('Division by zero');
    expect(() => new Fraction(1, 0)).toThrow('Division by zero');
  });

  it('parses fraction strings and integers', () => {
    expect(Fraction.parse('3/4').toString()).toBe('3/4');
    expect(Fraction.parse('-5/2').toString()).toBe('-5/2');
    expect(Fraction.parse('7').toString()).toBe('7');
    expect(Fraction.parse('-4').toString()).toBe('-4');
  });
});
