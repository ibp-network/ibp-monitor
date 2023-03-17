
export function shortStash (stash: string): string {
  return stash.slice(0, 6) + '...' + stash.slice(-6)
}
