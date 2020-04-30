type Keyword = {
  word: string
  position: number
}

const boundary = /\s|\(|\[/

// Extracts a keyword from the source text, backtracking from the cursor position.
export default function keyword(text: string, key: string, cursor: number): Keyword | void {
  // Activation key not found in front of the cursor.
  const keyIndex = text.lastIndexOf(key, cursor - 1)
  if (keyIndex === -1) return

  // Space between the cursor and previous activation key.
  const spaceIndex = text.lastIndexOf(' ', cursor - 1)
  if (spaceIndex > keyIndex) return

  // Activation key must occur at word boundary.
  const pre = text[keyIndex - 1]
  if (pre && !boundary.test(pre)) return

  // Extract matched keyword.
  const word = text.substring(keyIndex + key.length, cursor)
  return {word, position: keyIndex + key.length}
}
