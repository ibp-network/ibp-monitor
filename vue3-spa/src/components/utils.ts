export function shortStash(stash: string): string {
  if (!stash || stash === '') return ''
  return stash.slice(0, 6) + '...' + stash.slice(-6)
}
