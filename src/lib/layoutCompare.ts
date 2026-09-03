const GRID_SIZE = 16
const MIN_LAYOUT_GAP = 0.03
const MODEL_PROXIMITY = 0.012

function otsuThreshold(gray: Float32Array): number {
  const hist = new Float32Array(256)
  for (let i = 0; i < gray.length; i++) {
    const bin = Math.min(255, Math.max(0, Math.round(gray[i]!)))
    hist[bin]! += 1
  }

  const total = gray.length
  let sum = 0
  for (let i = 0; i < 256; i++) sum += i * hist[i]!

  let sumB = 0
  let wB = 0
  let maxVariance = 0
  let threshold = 128

  for (let t = 0; t < 256; t++) {
    wB += hist[t]!
    if (wB === 0) continue
    const wF = total - wB
    if (wF === 0) break

    sumB += t * hist[t]!
    const mB = sumB / wB
    const mF = (sum - sumB) / wF
    const variance = wB * wF * (mB - mF) * (mB - mF)

    if (variance > maxVariance) {
      maxVariance = variance
      threshold = t
    }
  }

  return threshold
}

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

  const threshold = otsuThreshold(gray)
  const ink = new Float32Array(width * height)
  for (let i = 0; i < gray.length; i++) {
    ink[i] = gray[i]! < threshold ? 1 : 0
  }

  const cellWidth = Math.max(1, Math.floor(width / GRID_SIZE))
  const cellHeight = Math.max(1, Math.floor(height / GRID_SIZE))
  const features = new Float32Array(GRID_SIZE * GRID_SIZE * 2)
  let offset = 0

  for (let gy = 0; gy < GRID_SIZE; gy++) {
    for (let gx = 0; gx < GRID_SIZE; gx++) {
      let inkSum = 0
      let edgeSum = 0
      let count = 0

      const startX = gx * cellWidth
      const startY = gy * cellHeight
      const endX = Math.min(startX + cellWidth, width)
      const endY = Math.min(startY + cellHeight, height)

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const value = ink[y * width + x]!
          inkSum += value

          if (x + 1 < endX) {
            edgeSum += Math.abs(value - ink[y * width + x + 1]!)
          }
          if (y + 1 < endY) {
            edgeSum += Math.abs(value - ink[(y + 1) * width + x]!)
          }
          count++
        }
      }

      features[offset++] = count > 0 ? inkSum / count : 0
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
  if (scores.length === 0) return 1

  const sorted = [...scores].sort((a, b) => b - a)
  const maxScore = sorted[0]!

  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i]! - sorted[i + 1]!
    if (gap >= MIN_LAYOUT_GAP) {
      return (sorted[i]! + sorted[i + 1]!) / 2
    }
  }

  return maxScore - MODEL_PROXIMITY
}

export function detectLayoutMatchIndices(
  modelFeatures: Float32Array,
  allFeatures: Float32Array[],
): Set<number> {
  const scores = computeLayoutSimilarityScores(modelFeatures, allFeatures)
  const threshold = computeLayoutMatchThreshold(scores)
  const layoutMatchIndices = new Set<number>()
  let maxIndex = 0
  let maxScore = -Infinity

  scores.forEach((score, index) => {
    if (score > maxScore) {
      maxScore = score
      maxIndex = index
    }
    if (score >= threshold) layoutMatchIndices.add(index)
  })

  layoutMatchIndices.add(maxIndex)
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
