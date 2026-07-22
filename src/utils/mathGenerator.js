/**
 * mathGenerator.js
 * Procedurally generates math problems by difficulty level.
 * No hardcoded question bank — every call produces a fresh problem.
 *
 * Supported problem types by difficulty:
 *
 *  easy   → add, subtract, multiply, divide (clean), square
 *  medium → all easy + square root (perfect), percent, multi-step, cube
 *  hard   → all medium + cube root (perfect), large multiply, chained ops,
 *            fraction of a number, algebraic solve-for-x
 */

// ─── small helpers ────────────────────────────────────────────────────────────

/** Integer in [min, max] inclusive */
const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Pick one item at random from an array */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Shuffle array (Fisher-Yates) */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Perfect squares 2–20 for clean √ problems
const PERFECT_SQUARES = [4,9,16,25,36,49,64,81,100,121,144,169,196,225,256,289,324,361,400];
// Perfect cubes 2–10
const PERFECT_CUBES   = [8,27,64,125,216,343,512,729,1000];

/**
 * Generate distractor answers for MCQ.
 * Tries to stay "close but wrong" so options are plausible.
 */
export const generateDistractors = (correct, count = 3) => {
  const seen = new Set([correct]);
  const result = [];

  // Strategy 1: small offsets scaled to answer magnitude
  const mag = Math.max(1, Math.floor(Math.abs(correct) / 10));
  const offsets = shuffle([-3,-2,-1,1,2,3].map(o => o * mag));

  for (const o of offsets) {
    const candidate = correct + o;
    if (candidate > 0 && !seen.has(candidate)) {
      seen.add(candidate);
      result.push(candidate);
      if (result.length === count) return result;
    }
  }

  // Strategy 2: percentage-based offsets if we still need more
  for (const pct of [0.1, 0.2, 0.5, 1.5, 2]) {
    const candidate = Math.round(correct * (1 + pct));
    if (candidate > 0 && !seen.has(candidate)) {
      seen.add(candidate);
      result.push(candidate);
      if (result.length === count) return result;
    }
  }

  // Strategy 3: fallback absolute offsets
  let fallback = 1;
  while (result.length < count) {
    if (!seen.has(correct + fallback)) { result.push(correct + fallback); seen.add(correct + fallback); }
    if (result.length < count && !seen.has(correct - fallback) && correct - fallback > 0) {
      result.push(correct - fallback); seen.add(correct - fallback);
    }
    fallback++;
  }

  return result.slice(0, count);
};

// ─── problem generators per type ─────────────────────────────────────────────

const genAdd = (level) => {
  const [lo, hi] = level === 'easy' ? [5, 99] : level === 'medium' ? [50, 999] : [100, 9999];
  const a = ri(lo, hi), b = ri(lo, hi);
  return { q: `${a} + ${b} = ?`, a: a + b, type: 'add' };
};

const genSubtract = (level) => {
  const [lo, hi] = level === 'easy' ? [5, 99] : level === 'medium' ? [50, 999] : [100, 9999];
  let a = ri(lo, hi), b = ri(lo, hi);
  if (b > a) [a, b] = [b, a]; // keep answer positive
  return { q: `${a} − ${b} = ?`, a: a - b, type: 'subtract' };
};

const genMultiply = (level) => {
  if (level === 'easy') {
    const a = ri(2, 12), b = ri(2, 12);
    return { q: `${a} × ${b} = ?`, a: a * b, type: 'multiply' };
  }
  if (level === 'medium') {
    const a = ri(11, 25), b = ri(11, 25);
    return { q: `${a} × ${b} = ?`, a: a * b, type: 'multiply' };
  }
  // hard
  const a = ri(21, 99), b = ri(21, 99);
  return { q: `${a} × ${b} = ?`, a: a * b, type: 'multiply' };
};

const genDivide = (level) => {
  // Always produce a clean whole-number answer
  if (level === 'easy') {
    const divisor = ri(2, 12);
    const quotient = ri(2, 12);
    const dividend = divisor * quotient;
    return { q: `${dividend} ÷ ${divisor} = ?`, a: quotient, type: 'divide' };
  }
  if (level === 'medium') {
    const divisor = ri(6, 25);
    const quotient = ri(6, 25);
    const dividend = divisor * quotient;
    return { q: `${dividend} ÷ ${divisor} = ?`, a: quotient, type: 'divide' };
  }
  // hard
  const divisor = ri(11, 50);
  const quotient = ri(11, 50);
  const dividend = divisor * quotient;
  return { q: `${dividend} ÷ ${divisor} = ?`, a: quotient, type: 'divide' };
};

const genSquare = (level) => {
  const base = level === 'easy' ? ri(2, 12) : level === 'medium' ? ri(11, 20) : ri(21, 35);
  return { q: `${base}² = ?`, a: base * base, type: 'square' };
};

const genCube = (level) => {
  const base = level === 'medium' ? ri(2, 8) : ri(5, 12);
  return { q: `${base}³ = ?`, a: base ** 3, type: 'cube' };
};

const genSqrt = (level) => {
  const pool = level === 'medium'
    ? PERFECT_SQUARES.filter(n => n <= 225)
    : PERFECT_SQUARES;
  const n = pick(pool);
  return { q: `√${n} = ?`, a: Math.round(Math.sqrt(n)), type: 'sqrt' };
};

const genCbrt = () => {
  const n = pick(PERFECT_CUBES);
  return { q: `∛${n} = ?`, a: Math.round(Math.cbrt(n)), type: 'cbrt' };
};

const genPercent = (level) => {
  const pcts  = level === 'medium' ? [10,15,20,25,50] : [5,12,15,33,40,60,75];
  const bases = level === 'medium' ? [40,60,80,120,200,250,400] : [120,240,360,480,750,900,1200];
  const pct  = pick(pcts);
  const base = pick(bases);
  const ans  = Math.round((pct / 100) * base);
  return { q: `${pct}% of ${base} = ?`, a: ans, type: 'percent' };
};

const genMultiStep = (level) => {
  if (level === 'medium') {
    const a = ri(2, 15), b = ri(2, 15), c = ri(1, 20);
    const op = pick(['+', '−']);
    const ans = op === '+' ? a * b + c : a * b - c;
    if (ans <= 0) return genMultiStep(level); // retry if negative
    return { q: `(${a} × ${b}) ${op} ${c} = ?`, a: ans, type: 'multistep' };
  }
  // hard
  const a = ri(10, 30), b = ri(10, 30), c = ri(5, 50), d = ri(2, 10);
  const ans = a * b + c - d;
  if (ans <= 0) return genMultiStep(level);
  return { q: `(${a} × ${b}) + ${c} − ${d} = ?`, a: ans, type: 'multistep' };
};

const genSolveX = () => {
  // ax + b = c  → x = (c - b) / a
  const a = ri(2, 12), x = ri(1, 20);
  const b = ri(1, 30);
  const c = a * x + b;
  return { q: `${a}x + ${b} = ${c},  x = ?`, a: x, type: 'algebra' };
};

const genFractionOf = () => {
  // (p/q) of n  — keep answer whole
  const fracs = [[1,2],[1,3],[1,4],[2,3],[3,4],[1,5],[2,5],[3,5]];
  const [p, q] = pick(fracs);
  const n = ri(2, 20) * q; // multiple of q so answer is whole
  return { q: `${p}/${q} of ${n} = ?`, a: (p * n) / q, type: 'fraction' };
};

// ─── type pools by difficulty ─────────────────────────────────────────────────

const EASY_TYPES   = ['add','subtract','multiply','divide','square'];
const MEDIUM_TYPES = ['add','subtract','multiply','divide','square','cube','sqrt','percent','multistep'];
const HARD_TYPES   = ['add','subtract','multiply','divide','square','cube','sqrt','cbrt','percent','multistep','algebra','fraction'];

// ─── main export ──────────────────────────────────────────────────────────────

/**
 * generateMathProblem(difficulty)
 *
 * Returns { q: string, a: number, type: string, level: string }
 *
 * @param {'easy'|'medium'|'hard'} difficulty
 */
export const generateMathProblem = (difficulty = 'easy') => {
  const pool = difficulty === 'easy'   ? EASY_TYPES
             : difficulty === 'medium' ? MEDIUM_TYPES
             : HARD_TYPES;

  const type = pick(pool);

  let problem;
  switch (type) {
    case 'add':       problem = genAdd(difficulty);       break;
    case 'subtract':  problem = genSubtract(difficulty);  break;
    case 'multiply':  problem = genMultiply(difficulty);  break;
    case 'divide':    problem = genDivide(difficulty);    break;
    case 'square':    problem = genSquare(difficulty);    break;
    case 'cube':      problem = genCube(difficulty);      break;
    case 'sqrt':      problem = genSqrt(difficulty);      break;
    case 'cbrt':      problem = genCbrt();                break;
    case 'percent':   problem = genPercent(difficulty);   break;
    case 'multistep': problem = genMultiStep(difficulty); break;
    case 'algebra':   problem = genSolveX();              break;
    case 'fraction':  problem = genFractionOf();          break;
    default:          problem = genAdd(difficulty);
  }

  return { ...problem, level: difficulty };
};

/**
 * generateMathBatch(difficulty, count)
 * Generates `count` unique problems (no duplicate questions).
 */
export const generateMathBatch = (difficulty = 'easy', count = 8) => {
  const seen = new Set();
  const results = [];
  let attempts = 0;

  while (results.length < count && attempts < count * 10) {
    attempts++;
    const p = generateMathProblem(difficulty);
    if (!seen.has(p.q)) {
      seen.add(p.q);
      results.push(p);
    }
  }

  return results;
};