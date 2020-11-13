import query from '../dist/query'

describe('text-expander single word parsing', function() {
  it('does not match empty text', function() {
    const found = query('', ':', 0)
    assert(found == null)
  })

  it('does not match without activation key', function() {
    const found = query('cat', ':', 3)
    assert(found == null)
  })

  it('matches only activation key', function() {
    const found = query(':', ':', 1)
    assert.deepEqual(found, {text: '', position: 1})
  })

  it('matches trailing activation key', function() {
    const found = query('hi :', ':', 4)
    assert.deepEqual(found, {text: '', position: 4})
  })

  it('matches start of text', function() {
    const found = query(':cat', ':', 4)
    assert.deepEqual(found, {text: 'cat', position: 1})
  })

  it('matches end of text', function() {
    const found = query('hi :cat', ':', 7)
    assert.deepEqual(found, {text: 'cat', position: 4})
  })

  it('matches middle of text', function() {
    const found = query('hi :cat bye', ':', 7)
    assert.deepEqual(found, {text: 'cat', position: 4})
  })

  it('matches only at word boundary', function() {
    const found = query('hi:cat', ':', 6)
    assert(found == null)
  })

  it('matches last activation key word', function() {
    const found = query('hi :cat bye :dog', ':', 16)
    assert.deepEqual(found, {text: 'dog', position: 13})
  })

  it('matches closest activation key word', function() {
    const found = query('hi :cat bye :dog', ':', 7)
    assert.deepEqual(found, {text: 'cat', position: 4})
  })

  it('does not match with a space between cursor and activation key', function() {
    const found = query('hi :cat bye', ':', 11)
    assert(found == null)
  })
})

describe('text-expander multi word parsing', function() {
  it('does not match empty text', function() {
    const found = query('', ':', 0, true)
    assert(found == null)
  })

  it('does not match without activation key', function() {
    const found = query('cat', ':', 3, true)
    assert(found == null)
  })

  it('matches only activation key', function() {
    const found = query(':', ':', 1, true)
    assert.deepEqual(found, {text: '', position: 1})
  })

  it('matches trailing activation key', function() {
    const found = query('hi :', ':', 4, true)
    assert.deepEqual(found, {text: '', position: 4})
  })

  it('matches start of text', function() {
    const found = query(':cat', ':', 4, true)
    assert.deepEqual(found, {text: 'cat', position: 1})
  })

  it('matches end of text', function() {
    const found = query('hi :cat', ':', 7, true)
    assert.deepEqual(found, {text: 'cat', position: 4})
  })

  it('matches middle of text', function() {
    const found = query('hi :cat bye', ':', 7, true)
    assert.deepEqual(found, {text: 'cat', position: 4})
  })

  it('matches only at word boundary', function() {
    const found = query('hi:cat', ':', 6, true)
    assert(found == null)
  })

  it('matches last activation key word', function() {
    const found = query('hi :cat bye :dog', ':', 16, true)
    assert.deepEqual(found, {text: 'dog', position: 13})
  })

  it('matches closest activation key word', function() {
    const found = query('hi :cat bye :dog', ':', 7, true)
    assert.deepEqual(found, {text: 'cat', position: 4})
  })

  it('matches with a space between cursor and activation key', function() {
    const found = query('hi :cat bye', ':', 11, true)
    assert.deepEqual(found, {text: 'cat bye', position: 4})
  })

  it('does not match with a dot between cursor and activation key', function() {
    const found = query('hi :cat. bye', ':', 11, true)
    assert(found == null)
  })

  it('does not match with a space between text and activation key', function() {
    const found = query('hi : cat bye', ':', 7, true)
    assert(found == null)
  })
})
