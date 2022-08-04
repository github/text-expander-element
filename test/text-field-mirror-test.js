import textFieldMirrorOriginal from '../dist/text-field-mirror'
import {valueOf} from '../dist/trix-editor-element'

function textFieldMirror(textField, markerPosition) {
  return textFieldMirrorOriginal(textField, markerPosition, valueOf)
}

describe('textFieldMirror', function () {
  let trixEditor

  beforeEach(function () {
    trixEditor = document.createElement('trix-editor')
    document.body.append(trixEditor)
  })

  afterEach(function () {
    for (const element of document.body.children) element.remove()
  })

  it('create mirror for trixEditor', function () {
    const {mirror, marker} = textFieldMirror(trixEditor)
    assert.ok(mirror)
    assert.ok(marker)
  })

  it('returns an Element attached to the DOM', function () {
    let {mirror: ancestor} = textFieldMirror(trixEditor)
    while (ancestor.parentNode) {
      ancestor = ancestor.parentNode
    }
    assert.equal(ancestor, document)
  })

  it('returns the same Element on multiple calls', function () {
    assert.equal(textFieldMirror(trixEditor).mirror, textFieldMirror(trixEditor).mirror)
  })

  it('returns a new Element when the old mirror is detached from the DOM', function () {
    const {mirror} = textFieldMirror(trixEditor)
    mirror.parentNode.removeChild(mirror)
    assert.notEqual(textFieldMirror(trixEditor).mirror, mirror)
  })
})
