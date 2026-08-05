const GRID_SIZE = 8
const MIN_LAYOUT_GAP = 0.03
const FALLBACK_LAYOUT_THRESHOLD = 0.97
const MIN_LAYOUT_CLUSTER_THRESHOLD = 0.9

export function extractFeatures(imageData: ImageData): Float32Array {
  const { width, height, data } = imageData
  const gray = new Float32Array(width * height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      gray[y * width + x] =
        0.299 * (data[idx] ?? 0) + 0.587 * (data[idx + 1] ?? 0) + 0.114 * (data[idx + 2] ?? 0)
    }
  }

  const cellWidth = Math.max(1, Math.floor(width / GRID_SIZE))
  const cellHeight = Math.max(1, Math.floor(height / GRID_SIZE))
  const features = new Float32Array(GRID_SIZE * GRID_SIZE * 2)
  let offset = 0

  for (let gy = 0; gy < GRID_SIZE; gy++) {
    for (let gx = 0; gx < GRID_SIZE; gx++) {
      let luminanceSum = 0
      let edgeSum = 0
      let count = 0

      const startX = gx * cellWidth
      const startY = gy * cellHeight
      const endX = Math.min(startX + cellWidth, width)
      const endY = Math.min(startY + cellHeight, height)

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const g = gray[y * width + x]!
          luminanceSum += g

          if (x + 1 < endX) {
            edgeSum += Math.abs(g - gray[y * width + x + 1]!)
          }
          if (y + 1 < endY) {
            edgeSum += Math.abs(g - gray[(y + 1) * width + x]!)
          }
          count++
        }
      }

      features[offset++] = count > 0 ? luminanceSum / count : 0
      features[offset++] = count > 0 ? edgeSum / count : 0
    }
  }

  return features
}

export function normalizeLayoutFeatures(features: Float32Array): Float32Array {
  let mean = 0
  for (let i = 0; i < features.length; i++) mean += features[i]!
  mean /= features.length

  let variance = 0
  for (let i = 0; i < features.length; i++) {
    const delta = features[i]! - mean
    variance += delta * delta
  }

  const std = Math.sqrt(variance) || 1
  const normalized = new Float32Array(features.length)

  for (let i = 0; i < features.length; i++) {
    normalized[i] = (features[i]! - mean) / std
  }

  return normalized
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!
    normA += a[i]! * a[i]!
    normB += b[i]! * b[i]!
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  if (denominator === 0) return 0
  return dot / denominator
}

export function computeLayoutSimilarityScores(
  modelFeatures: Float32Array,
  allFeatures: Float32Array[],
): number[] {
  const normalizedModel = normalizeLayoutFeatures(modelFeatures)

  return allFeatures.map((features) =>
    cosineSimilarity(normalizedModel, normalizeLayoutFeatures(features)),
  )
}

export function computeLayoutMatchThreshold(scores: number[]): number {
  if (scores.length === 0) return FALLBACK_LAYOUT_THRESHOLD

  const sorted = [...scores].sort((a, b) => b - a)
  let maxGap = 0
  let cutScore = sorted[0]!

  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i]! - sorted[i + 1]!
    if (gap > maxGap) {
      maxGap = gap
      cutScore = (sorted[i]! + sorted[i + 1]!) / 2
    }
  }

  if (maxGap >= MIN_LAYOUT_GAP) {
    return Math.max(cutScore, MIN_LAYOUT_CLUSTER_THRESHOLD)
  }

  return FALLBACK_LAYOUT_THRESHOLD
}

export function detectLayoutMatchIndices(
  modelFeatures: Float32Array,
  allFeatures: Float32Array[],
): Set<number> {
  const scores = computeLayoutSimilarityScores(modelFeatures, allFeatures)
  const threshold = computeLayoutMatchThreshold(scores)
  const layoutMatchIndices = new Set<number>()

  scores.forEach((score, index) => {
    if (score >= threshold) layoutMatchIndices.add(index)
  })

  return layoutMatchIndices
}

export function groupPagesByLayoutMatches(
  totalPages: number,
  layoutMatchIndices: Set<number>,
): number[][] {
  const groups: number[][] = []
  let current: number[] = []

  for (let i = 0; i < totalPages; i++) {
    if (layoutMatchIndices.has(i)) {
      if (current.length > 0) groups.push(current)
      current = [i]
    } else {
      current.push(i)
    }
  }

  if (current.length > 0) groups.push(current)
  return groups
}
