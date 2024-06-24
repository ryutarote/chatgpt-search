export enum MatchMode {
  Exact = 0,
  Include = 1,
  WildcardSpace = 2,
}

export class Asearch {
  static MAXLENGTH = 31
  readonly matchMode: MatchMode
  readonly pattern: string
  private readonly acceptPattern: number
  private readonly initPattern: number
  private readonly loopMask: number = 0
  masks: { [char: string]: number } = {}

  constructor (pattern: string, mode: MatchMode = MatchMode.Exact) {
    if (pattern.length > Asearch.MAXLENGTH) {
      throw new Error(
				`Pattern must be shorter than ${
					Asearch.MAXLENGTH + 1
				} chars. But given ${pattern}`
      )
    }
    this.matchMode = mode
    this.pattern = pattern
    const splitted = Array.from(pattern)
    const leftBit = 1 << Asearch.MAXLENGTH
    this.initPattern = leftBit >>> 0
    this.acceptPattern = leftBit >>> splitted.length
    if (mode === MatchMode.Include) {
      this.loopMask = this.initPattern | this.acceptPattern
    }
    let mask = 0
    for (const c of splitted) {
      if (mode === MatchMode.WildcardSpace && c === ' ') {
        this.loopMask |= leftBit >>> mask
        this.acceptPattern <<= 1
        continue
      }
      for (const key of [c, c.toLocaleLowerCase(), c.toUpperCase()]) {
        this.masks[key] = this.masks[key] || 0
        this.masks[key] |= leftBit >>> mask
      }
      mask++
    }
  }

  match (query: string, ambig: number = 0): boolean {
    const states = Array.from({ length: ambig + 1 }).map(
      (_, index) => this.initPattern >>> index
    )
    for (const char of query) {
      const mask = this.masks[char] || 0
      for (let index = states.length - 1; index > 0; index--) {
        states[index] =
					(states[index] & this.loopMask) |
					((states[index] & mask) >>> 1) |
					(states[index - 1] >>> 1) |
					states[index - 1]
      }
      states[0] = ((states[0] & mask) >>> 1) | (states[0] & this.loopMask)
      for (let index = 1; index < states.length; index++) {
        states[index] |= states[index - 1] >>> 1
      }
    }
    return Boolean(states[ambig] & this.acceptPattern)
  }
}
