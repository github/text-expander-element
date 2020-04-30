import textFieldMirror from '../dist/text-field-mirror'

describe('textFieldMirror', function() {
  let textarea
  let input

  beforeEach(function() {
    textarea = document.createElement('textarea')
    input = document.createElement('input')
    input.type = 'text'
    document.body.append(textarea, input)
  })

  afterEach(function() {
    document.body.innerHTML = ''
  })

  it('create mirror for textarea', function() {
    const {mirror, marker} = textFieldMirror(textarea)
    assert.ok(mirror)
    assert.ok(marker)
  })

  it('create mirror for text input', function() {
    const {mirror, marker} = textFieldMirror(input)
    assert.ok(mirror)
    assert.ok(marker)
  })

  it('returns an Element attached to the DOM', function() {
    let {mirror: ancestor} = textFieldMirror(textarea)
    while (ancestor.parentNode) {
      ancestor = ancestor.parentNode
    }
    assert.equal(ancestor, document)
  })

  it('returns the same Element on multiple calls', function() {
    assert.equal(textFieldMirror(textarea).mirror, textFieldMirror(textarea).mirror)
  })

  it('returns a new Element when the old mirror is detached from the DOM', function() {
    const {mirror} = textFieldMirror(textarea)
    mirror.parentNode.removeChild(mirror)
    assert.notEqual(textFieldMirror(textarea).mirror, mirror)
  })
})
