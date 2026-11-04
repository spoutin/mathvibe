export interface ScientificResult {
  success: boolean;
  result: number;
  display: string;
  error?: string;
}

export function evaluateScientific(
  rawInput: string,
  angleMode: 'deg' | 'rad' = 'deg',
  lastAns: number = 0
): ScientificResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { success: false, result: 0, display: '0', error: 'Please enter an expression.' };
  }

  try {
    const tokens = tokenizeScientific(trimmed, lastAns);
    const rpn = shuntingYard(tokens);
    const val = evaluateRPN(rpn, angleMode);

    if (!Number.isFinite(val) || Number.isNaN(val)) {
      throw new Error('Domain error: result is undefined or not a real number.');
    }

    const cleanedVal = cleanFloat(val);
    return {
      success: true,
      result: cleanedVal,
      display: cleanedVal.toString(),
    };
  } catch (err: any) {
    return {
      success: false,
      result: 0,
      display: 'Error',
      error: err.message || 'Invalid calculation.',
    };
  }
}

type TokenType = 'num' | 'op' | 'func' | 'lparen' | 'rparen' | 'postfix' | 'unary';

interface Token {
  type: TokenType;
  value: string;
  num?: number;
}

function tokenizeScientific(input: string, lastAns: number): Token[] {
  const tokens: Token[] = [];
  const str = input
    .replace(/\s+/g, '')
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi');

  let i = 0;
  const funcs = ['asin', 'acos', 'atan', 'sin', 'cos', 'tan', 'cbrt', 'sqrt', 'log', 'abs', 'fact', 'ln'];

  while (i < str.length) {
    const ch = str[i];

    // Numbers & decimals (positive numbers)
    if (/\d/.test(ch) || (ch === '.' && /\d/.test(str[i + 1] || ''))) {
      let numStr = '';
      while (i < str.length && (/\d/.test(str[i]) || str[i] === '.')) {
        numStr += str[i];
        i++;
      }
      tokens.push({ type: 'num', value: numStr, num: parseFloat(numStr) });
      continue;
    }

    // Constants: pi, e, Ans
    if (str.substring(i, i + 3).toLowerCase() === 'ans') {
      tokens.push({ type: 'num', value: 'Ans', num: lastAns });
      i += 3;
      continue;
    }

    if (str.substring(i, i + 2).toLowerCase() === 'pi') {
      tokens.push({ type: 'num', value: 'pi', num: Math.PI });
      i += 2;
      continue;
    }

    if (ch === 'e' && !/[a-zA-Z]/.test(str[i + 1] || '') && !/[a-zA-Z]/.test(str[i - 1] || '')) {
      tokens.push({ type: 'num', value: 'e', num: Math.E });
      i++;
      continue;
    }

    // Functions
    let matchedFunc = false;
    for (const f of funcs) {
      if (str.substring(i, i + f.length).toLowerCase() === f) {
        tokens.push({ type: 'func', value: f });
        i += f.length;
        matchedFunc = true;
        break;
      }
    }
    if (matchedFunc) continue;

    // Postfix operators: factorial (!) and percent (%)
    if (ch === '!') {
      tokens.push({ type: 'postfix', value: '!' });
      i++;
      continue;
    }

    if (ch === '%') {
      tokens.push({ type: 'postfix', value: '%' });
      i++;
      continue;
    }

    // Parentheses
    if (ch === '(') {
      const prev = tokens[tokens.length - 1];
      if (prev && (prev.type === 'num' || prev.type === 'rparen' || prev.type === 'postfix')) {
        tokens.push({ type: 'op', value: '*' });
      }
      tokens.push({ type: 'lparen', value: '(' });
      i++;
      continue;
    }

    if (ch === ')') {
      tokens.push({ type: 'rparen', value: ')' });
      i++;
      continue;
    }

    // Minus sign handling (binary vs unary)
    if (ch === '-') {
      const prev = tokens[tokens.length - 1];
      const isUnary = !prev || prev.type === 'op' || prev.type === 'lparen' || prev.type === 'func' || prev.type === 'unary';

      if (isUnary) {
        i++;
        // Check if followed by digits -> read negative number directly
        if (i < str.length && (/\d/.test(str[i]) || str[i] === '.')) {
          let numStr = '-';
          while (i < str.length && (/\d/.test(str[i]) || str[i] === '.')) {
            numStr += str[i];
            i++;
          }
          tokens.push({ type: 'num', value: numStr, num: parseFloat(numStr) });
          continue;
        } else {
          // Unary negation operator for expressions e.g. -(3 + 4) or -sin(30)
          tokens.push({ type: 'unary', value: 'neg' });
          continue;
        }
      } else {
        tokens.push({ type: 'op', value: '-' });
        i++;
        continue;
      }
    }

    // Binary Operators
    if (ch === '+' || ch === '*' || ch === '/' || ch === '^') {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }

    throw new Error(`Unrecognized symbol: ${ch}`);
  }

  return tokens;
}

const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '^': 3,
  'neg': 4,
};

function shuntingYard(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const operatorStack: Token[] = [];

  for (const token of tokens) {
    if (token.type === 'num') {
      output.push(token);
    } else if (token.type === 'func') {
      operatorStack.push(token);
    } else if (token.type === 'postfix') {
      output.push(token);
    } else if (token.type === 'unary') {
      operatorStack.push(token);
    } else if (token.type === 'op') {
      const pCurrent = PRECEDENCE[token.value] || 0;
      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top.type === 'op' || top.type === 'unary') {
          const pTop = PRECEDENCE[top.value] || 0;
          if (token.value === '^' ? pCurrent < pTop : pCurrent <= pTop) {
            output.push(operatorStack.pop()!);
          } else {
            break;
          }
        } else if (top.type === 'func') {
          output.push(operatorStack.pop()!);
        } else {
          break;
        }
      }
      operatorStack.push(token);
    } else if (token.type === 'lparen') {
      operatorStack.push(token);
    } else if (token.type === 'rparen') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'lparen') {
        output.push(operatorStack.pop()!);
      }
      if (operatorStack.length === 0) {
        throw new Error('Mismatched parentheses.');
      }
      operatorStack.pop(); // discard '('
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'func') {
        output.push(operatorStack.pop()!);
      }
    }
  }

  while (operatorStack.length > 0) {
    const top = operatorStack.pop()!;
    if (top.type === 'lparen' || top.type === 'rparen') {
      throw new Error('Mismatched parentheses.');
    }
    output.push(top);
  }

  return output;
}

function evaluateRPN(rpn: Token[], angleMode: 'deg' | 'rad'): number {
  const stack: number[] = [];

  const toRad = (angle: number): number => (angleMode === 'deg' ? (angle * Math.PI) / 180 : angle);
  const fromRad = (rad: number): number => (angleMode === 'deg' ? (rad * 180) / Math.PI : rad);

  for (const token of rpn) {
    if (token.type === 'num') {
      stack.push(token.num!);
    } else if (token.type === 'unary' && token.value === 'neg') {
      if (stack.length < 1) throw new Error('Syntax error.');
      stack.push(-stack.pop()!);
    } else if (token.type === 'postfix') {
      if (stack.length < 1) throw new Error('Syntax error.');
      const n = stack.pop()!;
      if (token.value === '!') {
        stack.push(factorial(n));
      } else if (token.value === '%') {
        stack.push(n / 100);
      }
    } else if (token.type === 'op') {
      if (stack.length < 2) throw new Error('Syntax error.');
      const b = stack.pop()!;
      const a = stack.pop()!;

      switch (token.value) {
        case '+':
          stack.push(a + b);
          break;
        case '-':
          stack.push(a - b);
          break;
        case '*':
          stack.push(a * b);
          break;
        case '/':
          if (b === 0) throw new Error('Division by zero is undefined.');
          stack.push(a / b);
          break;
        case '^':
          if (a === 0 && b < 0) throw new Error('Division by zero: 0 raised to a negative power.');
          if (a < 0 && !Number.isInteger(b)) throw new Error('Domain error: negative number to a fractional power.');
          stack.push(Math.pow(a, b));
          break;
        default:
          throw new Error(`Unknown operator: ${token.value}`);
      }
    } else if (token.type === 'func') {
      if (stack.length < 1) throw new Error('Syntax error.');
      const arg = stack.pop()!;

      switch (token.value) {
        case 'sin': {
          const val = Math.sin(toRad(arg));
          stack.push(snapTrig(val));
          break;
        }
        case 'cos': {
          const val = Math.cos(toRad(arg));
          stack.push(snapTrig(val));
          break;
        }
        case 'tan': {
          const rad = toRad(arg);
          if (Math.abs(Math.cos(rad)) < 1e-12) {
            throw new Error('Domain error: tan is undefined at 90 degrees.');
          }
          const val = Math.tan(rad);
          stack.push(snapTrig(val));
          break;
        }
        case 'asin':
          if (arg < -1 || arg > 1) throw new Error('Domain error: asin argument must be between -1 and 1.');
          stack.push(fromRad(Math.asin(arg)));
          break;
        case 'acos':
          if (arg < -1 || arg > 1) throw new Error('Domain error: acos argument must be between -1 and 1.');
          stack.push(fromRad(Math.acos(arg)));
          break;
        case 'atan':
          stack.push(fromRad(Math.atan(arg)));
          break;
        case 'log':
          if (arg <= 0) throw new Error('Domain error: log of non-positive number.');
          stack.push(Math.log10(arg));
          break;
        case 'ln':
          if (arg <= 0) throw new Error('Domain error: ln of non-positive number.');
          stack.push(Math.log(arg));
          break;
        case 'sqrt':
          if (arg < 0) throw new Error('Domain error: square root of negative number.');
          stack.push(Math.sqrt(arg));
          break;
        case 'cbrt':
          stack.push(Math.cbrt(arg));
          break;
        case 'abs':
          stack.push(Math.abs(arg));
          break;
        case 'fact':
          stack.push(factorial(arg));
          break;
        default:
          throw new Error(`Unknown function: ${token.value}`);
      }
    }
  }

  if (stack.length !== 1) {
    throw new Error('Invalid mathematical expression.');
  }

  return stack[0];
}

function snapTrig(val: number): number {
  if (Math.abs(val) < 1e-12) return 0;
  if (Math.abs(val - 0.5) < 1e-12) return 0.5;
  if (Math.abs(val + 0.5) < 1e-12) return -0.5;
  if (Math.abs(val - 1) < 1e-12) return 1;
  if (Math.abs(val + 1) < 1e-12) return -1;
  return val;
}

function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error('Domain error: factorial is only defined for non-negative integers.');
  }
  if (n > 170) {
    throw new Error('Domain error: factorial overflow (max 170).');
  }
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

function cleanFloat(val: number): number {
  if (!Number.isFinite(val)) return val;
  const rounded = Math.round(val * 1e12) / 1e12;
  return rounded;
}
