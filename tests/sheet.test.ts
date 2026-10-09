import { test, expect } from 'claude-code/testing'
import { lines } from '../hooks/register'

test('every line fits 40 columns', async () => {
  for (const l of lines('')) expect(l.text.length <= 40).toBe(true)
})

test('filter keeps matching lines under their section', async () => {
  expect(lines('grep').map(l => l.text)).toEqual(['Files (NvChad)', 'Space fw      live grep'])
  expect(lines('TERMINAL').filter(l => !l.h).length).toBe(2)
  expect(lines('zzz')).toEqual([])
})
