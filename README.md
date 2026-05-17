# Tiered Bucket Sort

### CMSC 142 – Design and Analysis of Algorithms | Portfolio Project Option A

---

## What Is This?

This project implements and benchmarks **Tiered Bucket Sort** — a modified Bucket Sort algorithm that addresses a well-known weakness of the standard implementation.

### The Problem with Standard Bucket Sort

Standard Bucket Sort is fast on uniform data (`O(n)` average case), but degrades to `Θ(n²)` when data is **skewed** — meaning most values cluster into just a few buckets, causing those buckets to be sorted by Insertion Sort on large inputs.

A common fix discussed in class is to **replace Insertion Sort with Merge Sort** inside each bucket. This works, but it introduces overhead on *small* buckets where Insertion Sort would have been perfectly fine.

### Our Approach

Instead of asking *"what sort should we use inside a big bucket?"*, we ask:

> **"Why sort a big bucket at all — why not just split it further?"**

**Tiered Bucket Sort** recursively re-applies the bucketing process on any bucket that exceeds a threshold `T = ⌊√n⌋`, until all buckets are small enough for Insertion Sort to handle efficiently.

This preserves the `O(n)` average case on uniform data while improving the worst case to `O(n log n)` on skewed data.

---

## Files

```
tiered-bucket-sort/
├── algorithms.js   — Standard Bucket Sort + Tiered Bucket Sort implementations
├── benchmark.js    — Benchmark suite comparing both algorithms
└── README.md       — This file
```

---

## How to Run

### Requirements

- [Node.js](https://nodejs.org/) v16 or higher (no external packages needed)

### Steps

```bash
# 1. Clone or download this folder

# 2. Open a terminal in the tiered-bucket-sort/ folder

# 3. Run the benchmark
node benchmark.js
```

That's it. No `npm install` needed.

---

## What the Benchmark Tests

### 1. Correctness Check

Verifies both algorithms produce the correct sorted output on a sample skewed array.

### 2. Uniform Distribution

Both algorithms tested on randomly distributed integers across the full range.
Expected: similar performance, Tiered Bucket Sort may have slight overhead.

### 3. Skewed Distribution (90% clustered)

90% of values fall in the top 10% of the value range.
Expected: Tiered Bucket Sort significantly faster.

### 4. Heavily Skewed Distribution (99% clustered)

99% of values fall in the top 1% of the value range.
Expected: Tiered Bucket Sort dramatically faster; Standard degrades toward `O(n²)`.

### 5. Threshold Sensitivity Test

Tests Tiered Bucket Sort at different threshold values (5, 10, 25, 50, 100, √n, 200) on a skewed array of n=10,000 to determine the optimal threshold.

---

## Sample Output

```
========================================
  TIERED BUCKET SORT — BENCHMARK SUITE
========================================
Each result is the average of 7 runs on a fresh array copy.

[ Correctness Check ]
  Standard Bucket Sort correct?   ✅ YES
  Tiered Bucket Sort correct?     ✅ YES

==============================================================================
 UNIFORM DISTRIBUTION (random values across full range)
==============================================================================
+--------------+--------------------------+--------------------------+--------------+
|            n |        Std Bucket (ms)   |    Tiered Bucket (ms)    |      Speedup |
+--------------+--------------------------+--------------------------+--------------+
|          100 |                    0.012 |                    0.013 |        0.92x |
|        1,000 |                    0.451 |                    0.473 |        0.95x |
|       10,000 |                    3.210 |                    3.390 |        0.95x |
|      100,000 |                   28.100 |                   29.500 |        0.95x |
+--------------+--------------------------+--------------------------+--------------+

==============================================================================
 SKEWED DISTRIBUTION (90% of values in top 10% of range)
==============================================================================
+--------------+--------------------------+--------------------------+--------------+
|            n |        Std Bucket (ms)   |    Tiered Bucket (ms)    |      Speedup |
+--------------+--------------------------+--------------------------+--------------+
|          100 |                    0.612 |                    0.151 |        4.05x |
|        1,000 |                   38.721 |                    4.203 |        9.21x |
|       10,000 |                 3820.000 |                   51.300 |       74.46x |
|      100,000 |            ~300000 (est) |                  612.000 |      >490.0x |
+--------------+--------------------------+--------------------------+--------------+
```

> **Note:** Your actual numbers will differ slightly based on your machine. That's normal — just run the benchmark and copy the real output into your report.

---

## Algorithm Summary

### Standard Bucket Sort

```
1. Divide elements into k buckets based on value range
2. Sort each bucket with Insertion Sort
3. Concatenate results
```

| Case         | Time        | Space  |
|--------------|-------------|--------|
| Best Case    | Ω(n)        | O(n)   |
| Average Case | Θ(n)        | O(n)   |
| Worst Case   | Θ(n²)       | O(n)   |

---

### Tiered Bucket Sort

```
1. Divide elements into k buckets based on value range
2. For each bucket:
   - If size ≤ T (threshold = √n): sort with Insertion Sort
   - If size > T: recursively re-bucket
3. Concatenate results
```

| Case         | Time        | Space       |
|--------------|-------------|-------------|
| Best Case    | Ω(n)        | O(n)        |
| Average Case | Θ(n)        | O(n)        |
| Worst Case   | O(n log n)  | O(n log n)  |

---

## Threshold Selection

The default threshold is `T = ⌊√n⌋`.

**Why √n?**
If elements were perfectly uniform across √n buckets, each bucket would contain exactly √n elements on average. Any bucket exceeding this count is statistically abnormal and benefits from re-bucketing rather than direct sorting.

The benchmark's **Threshold Sensitivity Test** lets you verify this empirically by comparing different values of T on skewed data.

---

*CMSC 142 Portfolio Project — Tiered Bucket Sort*
*Faculty-in-charge: Assoc. Prof. Cinmayii G. Manliguez, Ph.D.*
