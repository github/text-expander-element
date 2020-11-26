import {Match} from './text-expander-element'

type Query = {
  text: string
  position: number
}

type QueryOptions = {
  lookBackIndex: number
  multiWord: boolean
  previousMatch: Match | null
}

const boundary = /\s|\(|\[/

// Extracts a keyword from the source text, backtracking from the cursor position.
export default function query(
  text: string,
  key: string,
  cursor: number,
  {multiWord, lookBackIndex, previousMatch}: QueryOptions = {
    multiWord: false,
    lookBackIndex: 0,
    previousMatch: null
  }
): Query | void {
  // Activation key not found in front of the cursor.
  let keyIndex = text.lastIndexOf(key, cursor - 1)
  if (keyIndex === -1) return

  // Stop matching at the lookBackIndex
  if (keyIndex < lookBackIndex) return

  if (multiWord) {
    if (previousMatch) {
      keyIndex = previousMatch.position - 1
    }

    // Space immediately after activation key followed by the cursor
    const charAfterKey = text[keyIndex + 1]
    if (charAfterKey === ' ' && cursor === keyIndex + 2) return

    // New line the cursor and previous activation key.
    const newLineIndex = text.lastIndexOf('\n', cursor - 1)
    if (newLineIndex > keyIndex) return

    // Dot between the cursor and previous activation key.
    const dotIndex = text.lastIndexOf('.', cursor - 1)
    if (dotIndex > keyIndex) return
  } else {
    // Space between the cursor and previous activation key.
    const spaceIndex = text.lastIndexOf(' ', cursor - 1)
    if (spaceIndex > keyIndex) return
  }

  // Activation key must occur at word boundary.
  const pre = text[keyIndex - 1]
  if (pre && !boundary.test(pre)) return

  // Extract matched keyword.
  const queryString = text.substring(keyIndex + key.length, cursor)
  return {
    text: queryString,
    position: keyIndex + key.length
  }
}
