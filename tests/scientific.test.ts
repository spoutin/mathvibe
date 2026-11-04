import { describe, it, expect } from 'vitest';
import { evaluateScientific } from '../src/lib/math/scientific.ts';

describe('High School Scientific Calculator Engine', () => {
  it('evaluates trig functions in degrees accurately', () => {
    const s30 = evaluateScientific('sin(30)', 'deg');
    expect(s30.success).toBe(true);
    expect(s30.result).toBe(0.5);

    const c60 = evaluateScientific('cos(60)', 'deg');
    expect(c60.success).toBe(true);
    expect(c60.result).toBe(0.5);

    const t45 = evaluateScientific('tan(45)', 'deg');
    expect(t45.success).toBe(true);
    expect(t45.result).toBe(1);
  });

  it('evaluates trig functions in radians', () => {
    const res = evaluateScientific('sin(pi / 2)', 'rad');
    expect(res.success).toBe(true);
    expect(res.result).toBe(1);
  });

  it('evaluates inverse trig in degrees', () => {
    const res = evaluateScientific('asin(0.5)', 'deg');
    expect(res.success).toBe(true);
    expect(res.result).toBe(30);
  });

  it('evaluates common and natural logarithms', () => {
    const log100 = evaluateScientific('log(100)', 'deg');
    expect(log100.success).toBe(true);
    expect(log100.result).toBe(2);

    const lne = evaluateScientific('ln(e)', 'deg');
    expect(lne.success).toBe(true);
    expect(lne.result).toBe(1);
  });

  it('evaluates powers and roots', () => {
    const r1 = evaluateScientific('sqrt(144)', 'deg');
    expect(r1.success).toBe(true);
    expect(r1.result).toBe(12);

    const r2 = evaluateScientific('cbrt(27)', 'deg');
    expect(r2.success).toBe(true);
    expect(r2.result).toBe(3);

    const r3 = evaluateScientific('2^4', 'deg');
    expect(r3.success).toBe(true);
    expect(r3.result).toBe(16);
  });

  it('evaluates factorials', () => {
    const res = evaluateScientific('fact(5)', 'deg');
    expect(res.success).toBe(true);
    expect(res.result).toBe(120);

    const res2 = evaluateScientific('5!', 'deg');
    expect(res2.success).toBe(true);
    expect(res2.result).toBe(120);
  });

  it('handles constants pi and e', () => {
    const rPi = evaluateScientific('pi', 'deg');
    expect(rPi.success).toBe(true);
    expect(rPi.result).toBeCloseTo(Math.PI, 6);

    const rE = evaluateScientific('e', 'deg');
    expect(rE.success).toBe(true);
    expect(rE.result).toBeCloseTo(Math.E, 6);
  });

  it('safely catches domain errors like sqrt(-9)', () => {
    const res = evaluateScientific('sqrt(-9)', 'deg');
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/domain error/i);
  });

  it('supports previous answer memory Ans', () => {
    const res = evaluateScientific('Ans + 10', 'deg', 25);
    expect(res.success).toBe(true);
    expect(res.result).toBe(35);
  });
});
