import {Match} from './text-expander-element'

type Query = {
  text: string
  position: number
}

type QueryOptions = {
  lookBackIndex: number
  multiWord: boolean
  match: Match | null
}

const boundary = /\s|\(|\[/

// Extracts a keyword from the source text, backtracking from the cursor position.
export default function query(
  text: string,
  key: string,
  cursor: number,
  {multiWord, lookBackIndex, match}: QueryOptions = {
    multiWord: false,
    lookBackIndex: 0,
    match: null
  }
): Query | void {
  // Activation key not found in front of the cursor.
  let keyIndex = text.lastIndexOf(key, cursor - 1)
  if (keyIndex === -1) return

  if (multiWord) {
    if (match) {
      keyIndex = match.position - 1
    }

    // Stop matching at the lookBackIndex
    if (keyIndex < lookBackIndex) return

    // Space immediately after activation key
    const charAfterKey = text[keyIndex + 1]
    if (charAfterKey === ' ') return

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
