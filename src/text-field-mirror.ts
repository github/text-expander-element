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
export default function textFieldMirror(
  textField: HTMLInputElement | HTMLTextAreaElement,
  markerPosition: number | null
): {mirror: HTMLElement; marker: HTMLElement} {
  const nodeName = textField.nodeName.toLowerCase()
  if (nodeName !== 'textarea' && nodeName !== 'input') {
    throw new Error('expected textField to a textarea or input')
  }

  let mirror = mirrorMap.get(textField)
  if (mirror && mirror.parentElement === textField.parentElement) {
    mirror.innerHTML = ''
  } else {
    mirror = document.createElement('div')
    mirrorMap.set(textField, mirror)
    const style = window.getComputedStyle(textField)
    const props = properties.slice(0)
    if (nodeName === 'textarea') {
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
  marker.innerHTML = '&nbsp;'

  let before
  let after
  if (typeof markerPosition === 'number') {
    let text = textField.value.substring(0, markerPosition)
    if (text) {
      before = document.createTextNode(text)
    }
    text = textField.value.substring(markerPosition)
    if (text) {
      after = document.createTextNode(text)
    }
  } else {
    const text = textField.value
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
