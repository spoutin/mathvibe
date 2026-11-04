export class Fraction {
  numerator: number;
  denominator: number;

  constructor(num: number, den: number = 1) {
    if (den === 0) {
      throw new Error('Division by zero');
    }

    if (!Number.isInteger(num) || !Number.isInteger(den)) {
      // Convert floating decimals to integer fraction if needed
      const numDecimals = (num.toString().split('.')[1] || '').length;
      const denDecimals = (den.toString().split('.')[1] || '').length;
      const factor = Math.pow(10, Math.max(numDecimals, denDecimals));
      num = Math.round(num * factor);
      den = Math.round(den * factor);
    }

    if (den < 0) {
      num = -num;
      den = -den;
    }

    const common = Fraction.gcd(Math.abs(num), Math.abs(den));
    this.numerator = num / common;
    this.denominator = den / common;
  }

  static gcd(a: number, b: number): number {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
      const t = y;
      y = x % y;
      x = t;
    }
    return x || 1;
  }

  static lcm(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / Fraction.gcd(a, b);
  }

  add(other: Fraction): Fraction {
    const num = this.numerator * other.denominator + other.numerator * this.denominator;
    const den = this.denominator * other.denominator;
    return new Fraction(num, den);
  }

  sub(other: Fraction): Fraction {
    const num = this.numerator * other.denominator - other.numerator * this.denominator;
    const den = this.denominator * other.denominator;
    return new Fraction(num, den);
  }

  mul(other: Fraction): Fraction {
    return new Fraction(this.numerator * other.numerator, this.denominator * other.denominator);
  }

  div(other: Fraction): Fraction {
    if (other.numerator === 0) {
      throw new Error('Division by zero');
    }
    return new Fraction(this.numerator * other.denominator, this.denominator * other.numerator);
  }

  pow(exponent: number): Fraction {
    if (exponent === 0) return new Fraction(1, 1);
    if (exponent > 0) {
      return new Fraction(Math.pow(this.numerator, exponent), Math.pow(this.denominator, exponent));
    } else {
      return new Fraction(Math.pow(this.denominator, -exponent), Math.pow(this.numerator, -exponent));
    }
  }

  toNumber(): number {
    return this.numerator / this.denominator;
  }

  toString(): string {
    if (this.denominator === 1) {
      return `${this.numerator}`;
    }
    return `${this.numerator}/${this.denominator}`;
  }

  static parse(val: string): Fraction {
    const str = val.trim();
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 2) {
        const n = parseInt(parts[0], 10);
        const d = parseInt(parts[1], 10);
        if (Number.isNaN(n) || Number.isNaN(d)) {
          throw new Error(`Invalid fraction: ${str}`);
        }
        return new Fraction(n, d);
      }
    }
    const num = parseFloat(str);
    if (Number.isNaN(num)) {
      throw new Error(`Invalid number: ${str}`);
    }
    if (Number.isInteger(num)) {
      return new Fraction(num, 1);
    }
    // Decimal to fraction
    const decimals = (str.split('.')[1] || '').length;
    const den = Math.pow(10, decimals);
    const n = Math.round(num * den);
    return new Fraction(n, den);
  }
}
