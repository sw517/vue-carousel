import isTrue from '@/scripts/helpers/isTrue'

describe('Helper: isTrue', () => {
  test('boolean', () => {
    expect(isTrue(true)).toBe(true)
    expect(isTrue(false)).toBe(false)
  })

  test('string', () => {
    expect(isTrue('true')).toBe(true)
    expect(isTrue('also true')).toBe(true)
    expect(isTrue('false')).toBe(false)
    expect(isTrue('')).toBe(false)
  })

  test('number', () => {
    expect(isTrue(-1)).toBe(true)
    expect(isTrue(0)).toBe(false)
    expect(isTrue(1)).toBe(true)
    expect(isTrue(2)).toBe(true)
  })

  test('array', () => {
    expect(isTrue([])).toBe(false)
    expect(isTrue([''])).toBe(true)
    expect(isTrue([1])).toBe(true)
  })

  test('object', () => {
    expect(isTrue({ test: true })).toBe(true)
    expect(isTrue({})).toBe(false)
  })

  test('empty', () => {
    expect(isTrue()).toBe(false)
  })

  test('null', () => {
    expect(isTrue(null)).toBe(false)
  })

  test('undefined', () => {
    expect(isTrue(undefined)).toBe(false)
  })
})
