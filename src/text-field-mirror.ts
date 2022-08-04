const properties = ['position:absolute;', 'overflow:auto;', 'word-wrap:break-word;', 'top:0px;', 'left:-9999px;']

// Copy CSS properties from text field to div that would affect the cursor position.
const propertyNamesToCopy = [
  'box-sizing',
  'font-family',
  'font-size',
  'font-style',
  'font-variant',
  'font-weight',
  'height',
  'letter-spacing',
  'line-height',
  'max-height',
  'min-height',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
  'border-bottom',
  'border-left',
  'border-right',
  'border-top',
  'text-decoration',
  'text-indent',
  'text-transform',
  'width',
  'word-spacing'
]

// Map from text field element to its mirror.
const mirrorMap = new WeakMap()

// Builds offscreen div that mirrors the text field.
//
// textField - A HTMLInputElement or HTMLTextAreaElement element
// markerPosition - Optional Number to position a cursor marker at
//                  (defaults to the end of the text)
//
// Returns an Element attached to the DOM. It is the callers
// responsibility to cleanup and remove the element after they are
// finished with their measurements.
export default function textFieldMirror<T extends HTMLElement>(
  textField: T,
  markerPosition: number | null,
  valueOf: (element: T) => string
): {mirror: HTMLElement; marker: HTMLElement} {
  const nodeName = textField.nodeName.toLowerCase()
  if (nodeName !== 'trix-editor') {
    throw new Error('expected textField to be a trix-editor')
  }

  let mirror = mirrorMap.get(textField)
  if (mirror && mirror.parentElement === textField.parentElement) {
    for (const element of mirror.children) element.remove()
  } else {
    mirror = document.createElement('div')
    mirrorMap.set(textField, mirror)
    const style = window.getComputedStyle(textField)
    const props = properties.slice(0)
    if (nodeName === 'trix-editor') {
      props.push('white-space:pre-wrap;')
    } else {
      props.push('white-space:nowrap;')
    }
    for (let i = 0, len = propertyNamesToCopy.length; i < len; i++) {
      const name = propertyNamesToCopy[i]
      props.push(`${name}:${style.getPropertyValue(name)};`)
    }
    mirror.style.cssText = props.join(' ')
  }

  const marker = document.createElement('span')
  marker.style.cssText = 'position: absolute;'
  marker.insertAdjacentHTML('afterbegin', '&nbsp;')

  let before
  let after
  if (typeof markerPosition === 'number') {
    let text = valueOf(textField).substring(0, markerPosition)
    if (text) {
      before = document.createTextNode(text)
    }
    text = valueOf(textField).substring(markerPosition)
    if (text) {
      after = document.createTextNode(text)
    }
  } else {
    const text = valueOf(textField)
    if (text) {
      before = document.createTextNode(text)
    }
  }

  if (before) {
    mirror.appendChild(before)
  }

  mirror.appendChild(marker)

  if (after) {
    mirror.appendChild(after)
  }

  if (!mirror.parentElement) {
    if (!textField.parentElement) {
      throw new Error('textField must have a parentElement to mirror')
    }
    textField.parentElement.insertBefore(mirror, textField)
  }

  mirror.scrollTop = textField.scrollTop
  mirror.scrollLeft = textField.scrollLeft

  return {mirror, marker}
}
