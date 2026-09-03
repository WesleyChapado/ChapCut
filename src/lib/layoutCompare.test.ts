import { describe, expect, it } from 'vitest'
import {
  computeLayoutMatchThreshold,
  detectLayoutMatchIndices,
  groupPagesByLayoutMatches,
} from './layoutCompare'

function layoutVector(kind: 'cover' | 'content'): Float32Array {
  const features = new Float32Array(512)
  for (let i = 0; i < features.length; i++) {
    if (kind === 'cover') {
      features[i] = i < 256 ? 1 : 0.05
    } else {
      features[i] = i < 256 ? 0.05 : 1
    }
  }
  return features
}

describe('groupPagesByLayoutMatches', () => {
  it('groups pages between layout cut points', () => {
    const groups = groupPagesByLayoutMatches(15, new Set([0, 5, 10]))
    expect(groups).toEqual([
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14],
    ])
  })
})

describe('computeLayoutMatchThreshold', () => {
  it('keeps only the high cluster for bimodal scores', () => {
    const scores = [1, 0.99, 0.985, 0.72, 0.71, 0.7, 0.69]
    const threshold = computeLayoutMatchThreshold(scores)
    const matches = scores.filter((score) => score >= threshold)
    expect(matches).toEqual([1, 0.99, 0.985])
  })

  it('does not mark every page when scores are unimodally high', () => {
    const scores = [1, ...Array.from({ length: 62 }, () => 0.98)]
    const threshold = computeLayoutMatchThreshold(scores)
    const matches = scores.filter((score) => score >= threshold)
    expect(matches.length).toBe(1)
    expect(matches[0]).toBe(1)
  })
})

describe('detectLayoutMatchIndices', () => {
  it('marks only cover-like pages in a bimodal set', () => {
    const covers = [layoutVector('cover'), layoutVector('cover'), layoutVector('cover')]
    const contents = [layoutVector('content'), layoutVector('content'), layoutVector('content')]
    const allFeatures = [covers[0]!, contents[0]!, contents[1]!, covers[1]!, contents[2]!, covers[2]!]
    const matches = detectLayoutMatchIndices(covers[0]!, allFeatures)
    expect([...matches].sort((a, b) => a - b)).toEqual([0, 3, 5])
  })

  it('does not split a 63-page document into 63 files when pages look alike', () => {
    const model = layoutVector('cover')
    const allFeatures = Array.from({ length: 63 }, (_, i) => {
      if (i === 0) return model
      const features = layoutVector('cover')
      for (let j = 0; j < features.length; j++) {
        features[j] = features[j]! * 0.7 + (j % 17) * 0.02
      }
      return features
    })

    const matches = detectLayoutMatchIndices(model, allFeatures)
    expect(matches.has(0)).toBe(true)
    expect(matches.size).toBeLessThan(63)
  })
})
