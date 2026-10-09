declare module 'claude-code' {
  interface PluginState {
    'vim-keys': { filter: Filter }
  }
}
export type Filter = string
