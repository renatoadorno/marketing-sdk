import { test, expect } from 'bun:test'
import { sha256 } from '../../src/core/hash'

test('sha256 produces correct hex hash', () => {
  // Known SHA-256 of "test"
  expect(sha256('test')).toBe('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08')
})

test('sha256 produces correct hash for email', () => {
  const hash = sha256('joao@email.com')
  expect(hash).toHaveLength(64)
  // Same input always produces same hash
  expect(sha256('joao@email.com')).toBe(hash)
})

test('sha256 produces different hashes for different inputs', () => {
  expect(sha256('a')).not.toBe(sha256('b'))
})
