import {TrixEditorElement, valueOf} from './trix-editor-element'
import textFieldMirror from './text-field-mirror'

// Get offset position of cursor in a `textField` field. The offset is the
// number of pixels from the top left of the `textField`. Useful for
// positioning a popup near the insertion point.
//
// const {top, left} = textFieldSelectionPosition(trixEditor)
//
// Measures offset position of cursor in text field.
//
// field - HTMLElement a trix-editor element
// index - Number index into textField.value (default: textField.selectionEnd)
//
// Returns object with {top, left} properties.
export default function textFieldSelectionPosition(
  field: TrixEditorElement,
  index: number
): {top: number; left: number} {
  const {mirror, marker} = textFieldMirror(field, index, valueOf)

  const mirrorRect = mirror.getBoundingClientRect()
  const markerRect = marker.getBoundingClientRect()

  setTimeout(() => {
    mirror.remove()
  }, 5000)

  return {
    top: markerRect.top - mirrorRect.top,
    left: markerRect.left - mirrorRect.left
  }
}
