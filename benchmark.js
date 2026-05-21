//  Measures and compares Standard Bucket Sort vs Tiered Bucket Sort
//  across different input sizes and distributions.
//  Run with:  node benchmark.js

const { standardBucketSort, tieredBucketSort } = require('./algorithms');

//  Array Generators

/** Uniform random integers between min and max */
function generateUniform(n, min = 0, max = 10000) {
  return Array.from({ length: n }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}

/**
 * Skewed distribution:
 * - (1 - skewRatio) of values spread across the full range
 * - skewRatio of values clustered in the top 10% of the range
 *
 * Example: skewRatio=0.9 means 90% of values pile into the top 10% of range
 */
function generateSkewed(n, min = 0, max = 10000, skewRatio = 0.9) {
  const clusterStart = Math.floor(max * 0.9);
  return Array.from({ length: n }, () => {
    if (Math.random() < skewRatio) {
      // Cluster in top 10% of range
      return Math.floor(Math.random() * (max - clusterStart + 1)) + clusterStart;
    } else {
      // Spread across full range
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  });
}

//  Benchmark Runner

/**
 * Runs a sorting function multiple times on fresh copies of the array,
 * returns the average elapsed time in milliseconds.
 */
function benchmark(sortFn, arr, runs = 5) {
  let total = 0;
  for (let i = 0; i < runs; i++) {
    const copy = [...arr]; // fresh copy each run so sorts don't affect each other
    const start = performance.now();
    sortFn(copy);
    const end = performance.now();
    total += end - start;
  }
  return total / runs;
}

function verify(original, sorted) {
  const reference = [...original].sort((a, b) => a - b);
  if (sorted.length !== reference.length) return false;
  for (let i = 0; i < reference.length; i++) {
    if (sorted[i] !== reference[i]) return false;
  }
  return true;
}

//  Table Printer

function printTable(title, rows) {
  const col = [12, 24, 24, 12];
  const pad = (s, w) => String(s).padStart(w);
  const line = '+' + col.map(w => '-'.repeat(w + 2)).join('+') + '+';

  console.log(`\n${'='.repeat(line.length)}`);
  console.log(` ${title}`);
  console.log('='.repeat(line.length));
  console.log(line);
  console.log(`| ${pad('n', col[0])} | ${pad('Std Bucket (ms)', col[1])} | ${pad('Tiered Bucket (ms)', col[2])} | ${pad('Speedup', col[3])} |`);
  console.log(line);

  for (const row of rows) {
    const [n, std, tiered] = row;
    const speedup = std > 0 ? (std / tiered).toFixed(2) + 'x' : 'N/A';
    console.log(
      `| ${pad(n.toLocaleString(), col[0])} | ${pad(std.toFixed(3), col[1])} | ${pad(tiered.toFixed(3), col[2])} | ${pad(speedup, col[3])} |`
    );
  }

  console.log(line);
}

//  Main

const INPUT_SIZES = [100, 1_000, 10_000, 100_000];
const RUNS_PER_SIZE = 7; // number of times each test is repeated and averaged

console.log('\n========================================');
console.log('  TIERED BUCKET SORT — BENCHMARK SUITE');
console.log('========================================');
console.log(`Each result is the average of ${RUNS_PER_SIZE} runs on a fresh array copy.\n`);

// --- CORRECTNESS CHECK ---
console.log('[ Correctness Check ]');
const testArr = generateSkewed(500);
const stdResult = standardBucketSort(testArr);
const tieredResult = tieredBucketSort(testArr);
console.log('  Standard Bucket Sort correct?  ', verify(testArr, stdResult) ? 'YES' : 'NO');
console.log('  Tiered Bucket Sort correct?    ', verify(testArr, tieredResult) ? 'YES' : 'NO');

// --- UNIFORM DISTRIBUTION ---
const uniformRows = [];
for (const n of INPUT_SIZES) {
  const arr = generateUniform(n);
  const stdTime = benchmark(standardBucketSort, arr, RUNS_PER_SIZE);
  const tieredTime = benchmark(tieredBucketSort, arr, RUNS_PER_SIZE);
  uniformRows.push([n, stdTime, tieredTime]);
}
printTable('UNIFORM DISTRIBUTION (random values across full range)', uniformRows);

// --- SKEWED DISTRIBUTION (90% clustered in top 10% of range) ---
const skewedRows = [];
for (const n of INPUT_SIZES) {
  const arr = generateSkewed(n, 0, 10000, 0.9);
  const stdTime = benchmark(standardBucketSort, arr, RUNS_PER_SIZE);
  const tieredTime = benchmark(tieredBucketSort, arr, RUNS_PER_SIZE);
  skewedRows.push([n, stdTime, tieredTime]);
}
printTable('SKEWED DISTRIBUTION (90% of values in top 10% of range)', skewedRows);

// --- HEAVILY SKEWED (99% clustered) ---
const heavilySkewedRows = [];
for (const n of INPUT_SIZES) {
  const arr = generateSkewed(n, 0, 10000, 0.99);
  const stdTime = benchmark(standardBucketSort, arr, RUNS_PER_SIZE);
  const tieredTime = benchmark(tieredBucketSort, arr, RUNS_PER_SIZE);
  heavilySkewedRows.push([n, stdTime, tieredTime]);
}
printTable('HEAVILY SKEWED DISTRIBUTION (99% of values in top 1% of range)', heavilySkewedRows);

// --- THRESHOLD SENSITIVITY TEST (Tiered only, skewed n=10000) ---
console.log('\n========================================');
console.log('  THRESHOLD SENSITIVITY TEST');
console.log('  (Tiered Bucket Sort, skewed n=10,000)');
console.log('========================================');
const thresholdArr = generateSkewed(10_000, 0, 10000, 0.9);
const thresholds = [5, 10, 25, 50, 100, 200];

console.log('\n  Threshold   |   Avg Time (ms)');
console.log('  ------------|----------------');
for (const t of thresholds) {
  const times = [];
  for (let i = 0; i < RUNS_PER_SIZE; i++) {
    const copy = [...thresholdArr];
    const start = performance.now();
    // Run with custom threshold
    const min = Math.min(...copy);
    const max = Math.max(...copy);
    // inline _tieredSort with custom t
    (function sort(arr, minV, maxV, threshold) {
      if (arr.length <= 1) return arr;
      const k = Math.max(2, threshold);
      const range = (maxV - minV) / k;
      const buckets = Array.from({ length: k }, () => []);
      for (const val of arr) {
        const idx = Math.min(Math.floor((val - minV) / range), k - 1);
        buckets[idx].push(val);
      }
      const result = [];
      for (const bucket of buckets) {
        if (bucket.length === 0) continue;
        if (bucket.length <= threshold) {
          for (let i = 1; i < bucket.length; i++) {
            let key = bucket[i], j = i - 1;
            while (j >= 0 && bucket[j] > key) { bucket[j + 1] = bucket[j]; j--; }
            bucket[j + 1] = key;
          }
          result.push(...bucket);
        } else {
          const bMin = Math.min(...bucket);
          const bMax = Math.max(...bucket);
          if (bMin === bMax) { result.push(...bucket); }
          else { result.push(...sort(bucket, bMin, bMax, threshold)); }
        }
      }
      return result;
    })(copy, min, max, t);
    times.push(performance.now() - start);
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const label = t === Math.floor(Math.sqrt(10_000)) ? `${t} (= √n)` : String(t);
  console.log(`  ${label.padEnd(12)}|   ${avg.toFixed(3)}`);
}

console.log('\n Benchmark complete.\n');
