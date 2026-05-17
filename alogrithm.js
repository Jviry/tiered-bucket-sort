function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}

//  (uses Insertion Sort inside every bucket, no re-bucketing)
function standardBucketSort(arr) {
  if (arr.length === 0) return [];

  const n = arr.length;
  const min = Math.min(...arr);
  const max = Math.max(...arr);

  if (min === max) return [...arr]; // all elements identical

  const k = Math.max(2, Math.floor(Math.sqrt(n))); // same bucket count for fair comparison
  const range = (max - min) / k;
  const buckets = Array.from({ length: k }, () => []);

  for (const val of arr) {
    const idx = Math.min(Math.floor((val - min) / range), k - 1);
    buckets[idx].push(val);
  }

  const result = [];
  for (const bucket of buckets) {
    if (bucket.length === 0) continue;
    result.push(...insertionSort(bucket));
  }

  return result;
}

//  (recursively re-buckets oversized buckets instead of sorting them directly)
function _tieredSort(arr, minVal, maxVal, threshold) {
  if (arr.length <= 1) return arr;

  const k = Math.max(2, threshold);
  const range = (maxVal - minVal) / k;
  const buckets = Array.from({ length: k }, () => []);

  for (const val of arr) {
    const idx = Math.min(Math.floor((val - minVal) / range), k - 1);
    buckets[idx].push(val);
  }

  const result = [];
  for (const bucket of buckets) {
    if (bucket.length === 0) continue;

    if (bucket.length <= threshold) {
      // Small enough — sort directly with Insertion Sort
      result.push(...insertionSort(bucket));
    } else {
      // Too big — re-bucket recursively
      const bMin = Math.min(...bucket);
      const bMax = Math.max(...bucket);

      if (bMin === bMax) {
        // All elements are identical — just push them (can't subdivide further)
        result.push(...bucket);
      } else {
        result.push(..._tieredSort(bucket, bMin, bMax, threshold));
      }
    }
  }

  return result;
}

function tieredBucketSort(arr) {
  if (arr.length === 0) return [];
  const threshold = Math.floor(Math.sqrt(arr.length));
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  if (min === max) return [...arr];
  return _tieredSort(arr, min, max, threshold);
}

module.exports = { standardBucketSort, tieredBucketSort };
