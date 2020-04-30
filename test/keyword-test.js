import keyword from '../dist/keyword'

describe('text-expander keyword parsing', function() {
  it('does not match empty text', function() {
    const found = keyword('', ':', 0)
    assert(found == null)
  })

  it('does not match without activation key', function() {
    const found = keyword('cat', ':', 3)
    assert(found == null)
  })

  it('matches only activation key', function() {
    const found = keyword(':', ':', 1)
    assert.deepEqual(found, {word: '', position: 1})
  })

  it('matches trailing activation key', function() {
    const found = keyword('hi :', ':', 4)
    assert.deepEqual(found, {word: '', position: 4})
  })

  it('matches start of text', function() {
    const found = keyword(':cat', ':', 4)
    assert.deepEqual(found, {word: 'cat', position: 1})
  })

  it('matches end of text', function() {
    const found = keyword('hi :cat', ':', 7)
    assert.deepEqual(found, {word: 'cat', position: 4})
  })

  it('matches middle of text', function() {
    const found = keyword('hi :cat bye', ':', 7)
    assert.deepEqual(found, {word: 'cat', position: 4})
  })

  it('matches only at word boundary', function() {
    const found = keyword('hi:cat', ':', 6)
    assert(found == null)
  })

  it('matches last activation key word', function() {
    const found = keyword('hi :cat bye :dog', ':', 16)
    assert.deepEqual(found, {word: 'dog', position: 13})
  })

  it('matches closest activation key word', function() {
    const found = keyword('hi :cat bye :dog', ':', 7)
    assert.deepEqual(found, {word: 'cat', position: 4})
  })

  it('does not match with a space between cursor and activation key', function() {
    const found = keyword('hi :cat bye', ':', 11)
    assert(found == null)
  })
})
