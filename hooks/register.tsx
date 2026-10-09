import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const PANE = 'vim-keys'
const TITLE = 'Vim / NvChad keys'
const filter = atom({ plugin: 'vim-keys', key: 'filter' } as const, '')

// Checked against NvChad v2.5 lua/nvchad/mappings.lua. Leader = Space.
export const SHEET: [string, [string, string][]][] = [
  ['Modes and saving', [
    ['i', 'insert mode'],
    ['Esc', 'back to normal mode'],
    [':w', 'save'],
    [':q', 'quit'],
    [':wq', 'save and quit'],
    [':q!', 'quit, drop changes'],
  ]],
  ['Moving', [
    ['h j k l', 'left down up right'],
    ['w b', 'next / prev word'],
    ['gg G', 'top / bottom of file'],
    ['0 $', 'start / end of line'],
    ['Ctrl-d Ctrl-u', 'half page down / up'],
    ['%', 'jump to matching bracket'],
  ]],
  ['Editing', [
    ['dd', 'delete (cut) line'],
    ['yy', 'copy (yank) line'],
    ['p', 'paste after cursor'],
    ['u', 'undo'],
    ['Ctrl-r', 'redo'],
    ['.', 'repeat last change'],
    ['ciw', 'change inner word'],
    ['x', 'delete char'],
    ['v / V', 'visual char / line'],
  ]],
  ['Search', [
    ['/text', 'search for text'],
    ['n N', 'next / prev match'],
    ['*', 'search word under cursor'],
    [':%s/a/b/g', 'replace a with b'],
  ]],
  ['Files (NvChad)', [
    ['Space ff', 'find files'],
    ['Space fw', 'live grep'],
    ['Space fo', 'recent files'],
    ['Ctrl-n', 'file tree'],
    ['Tab', 'next buffer'],
    ['Shift-Tab', 'prev buffer'],
    ['Space x', 'close buffer'],
  ]],
  ['Windows', [
    ['Ctrl-h/j/k/l', 'move between splits'],
    [':vsp', 'vertical split'],
    [':sp', 'horizontal split'],
  ]],
  ['Terminal and help', [
    ['Space h', 'horizontal terminal'],
    ['Space v', 'vertical terminal'],
    ['Space ch', 'cheatsheet'],
    ['Space th', 'themes'],
  ]],
]

// Section headers (h) and key lines; a word keeps only the lines containing it.
export function lines(word: string): { text: string; h?: boolean }[] {
  const w = word.trim().toLowerCase()
  return SHEET.flatMap(([title, rows]) => {
    const hits = rows
      .map(([key, what]) => `${key.padEnd(13)} ${what}`)
      .filter(line => line.toLowerCase().includes(w))
    return hits.length ? [{ text: title, h: true }, ...hits.map(text => ({ text }))] : []
  })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'vim',
      description: 'Toggle the Vim / NvChad keys pane; /vim <word> filters it',
      argumentHint: '[word]',
    })
    return next(e)
  })

  on('command.run', { command: 'vim' }, async ($, e) => {
    const word = e.args.trim()
    const isOpen = (await $.ui.panes()).some(p => p.id === PANE)
    if (!word && isOpen) {
      await $.ui.close({ id: PANE })
      return { text: 'Vim keys pane closed.' }
    }
    await update($, filter, () => word)
    await $.ui.open({ id: PANE, title: TITLE })
    return { text: word ? `Vim keys filtered by "${word}".` : 'Vim keys pane opened.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const word = await read($, filter)
    const shown = lines(word)
    return (
      <Box flexDirection="column">
        {word && <Text dimColor>filter: {word}</Text>}
        {shown.length === 0 && <Text dimColor>No key matches "{word}".</Text>}
        {shown.map(l => (l.h ? <Text bold>{l.text}</Text> : <Text>{l.text}</Text>))}
      </Box>
    )
  })
}
