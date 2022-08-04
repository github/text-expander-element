import query from '../dist/query'

describe('trix-mentions single word parsing', function () {
  it('does not match empty text', function () {
    const found = query('', ':', 0)
    assert(found == null)
  })

  it('does not match without activation key', function () {
    const found = query('cat', ':', 3)
    assert(found == null)
  })

  it('matches only activation key', function () {
    const found = query(':', ':', 1)
    assert.deepEqual(found, {text: '', position: 1})
  })

  it('matches trailing activation key', function () {
    const found = query('hi :', ':', 4)
    assert.deepEqual(found, {text: '', position: 4})
  })

  it('matches start of text', function () {
    const found = query(':cat', ':', 4)
    assert.deepEqual(found, {text: 'cat', position: 1})
  })

  it('matches end of text', function () {
    const found = query('hi :cat', ':', 7)
    assert.deepEqual(found, {text: 'cat', position: 4})
  })

  it('matches middle of text', function () {
    const found = query('hi :cat bye', ':', 7)
    assert.deepEqual(found, {text: 'cat', position: 4})
  })

  it('matches only at word boundary', function () {
    const found = query('hi:cat', ':', 6)
    assert(found == null)
  })

  it('matches last activation key word', function () {
    const found = query('hi :cat bye :dog', ':', 16)
    assert.deepEqual(found, {text: 'dog', position: 13})
  })

  it('matches closest activation key word', function () {
    const found = query('hi :cat bye :dog', ':', 7)
    assert.deepEqual(found, {text: 'cat', position: 4})
  })

  it('does not match with a space between cursor and activation key', function () {
    const found = query('hi :cat bye', ':', 11)
    assert(found == null)
  })
})

describe('trix-mentions multi word parsing', function () {
  it('does not match empty text', function () {
    const found = query('', ':', 0, {multiWord: true})
    assert(found == null)
  })

  it('does not match without activation key', function () {
    const found = query('cat', ':', 3, {multiWord: true})
    assert(found == null)
  })

  it('matches only activation key', function () {
    const found = query(':', ':', 1, {multiWord: true})
    assert.deepEqual(found, {text: '', position: 1})
  })

  it('matches trailing activation key', function () {
    const found = query('hi :', ':', 4, {multiWord: true})
    assert.deepEqual(found, {text: '', position: 4})
  })

  it('matches start of text', function () {
    const found = query(':cat', ':', 4, {multiWord: true})
    assert.deepEqual(found, {text: 'cat', position: 1})
  })

  it('matches end of text', function () {
    const found = query('hi :cat', ':', 7, {multiWord: true})
    assert.deepEqual(found, {text: 'cat', position: 4})
  })

  it('matches middle of text', function () {
    const found = query('hi :cat bye', ':', 7, {multiWord: true})
    assert.deepEqual(found, {text: 'cat', position: 4})
  })

  it('matches only at word boundary', function () {
    const found = query('hi:cat', ':', 6, {multiWord: true})
    assert(found == null)
  })

  it('matches last activation key word', function () {
    const found = query('hi :cat bye :dog', ':', 16, {multiWord: true})
    assert.deepEqual(found, {text: 'dog', position: 13})
  })

  it('matches closest activation key word', function () {
    const found = query('hi :cat bye :dog', ':', 7, {multiWord: true})
    assert.deepEqual(found, {text: 'cat', position: 4})
  })

  it('matches with a space between cursor and activation key', function () {
    const found = query('hi :cat bye', ':', 11, {multiWord: true})
    assert.deepEqual(found, {text: 'cat bye', position: 4})
  })

  it('does not match with a dot between cursor and activation key', function () {
    const found = query('hi :cat. bye', ':', 11, {multiWord: true})
    assert(found == null)
  })

  it('does not match with a space between text and activation key', function () {
    const found = query('hi : cat bye', ':', 7, {multiWord: true})
    assert(found == null)
  })
})

describe('trix-mentions multi word parsing with multiple activation keys', function () {
  it('does not match consecutive activation keys', function () {
    let found = query('::', ':', 2, {multiWord: true})
    assert(found == null)

    found = query('::', ':', 3, {multiWord: true})
    assert(found == null)

    found = query('hi :: there', ':', 5, {multiWord: true})
    assert(found == null)

    found = query('hi ::: there', ':', 6, {multiWord: true})
    assert(found == null)

    found = query('hi ::', ':', 5, {multiWord: true})
    assert(found == null)

    found = query('hi :::', ':', 6, {multiWord: true})
    assert(found == null)
  })

  it('uses lastMatchPosition to match', function () {
    let found = query('hi :cat :bye', ':', 12, {multiWord: true, lastMatchPosition: 4})
    assert.deepEqual(found, {text: 'cat :bye', position: 4})

    found = query('hi :cat :bye :::', ':', 16, {multiWord: true, lastMatchPosition: 4})
    assert.deepEqual(found, {text: 'cat :bye :::', position: 4})

    found = query(':hi :cat :bye :::', ':', 17, {multiWord: true, lastMatchPosition: 1})
    assert.deepEqual(found, {text: 'hi :cat :bye :::', position: 1})
  })
})

describe('trix-mentions limits the lookBack after commit', function () {
  it('does not match if lookBackIndex is bigger than activation key index', function () {
    const found = query('hi :cat bye', ':', 11, {multiWord: true, lookBackIndex: 7})
    assert(found == null)
  })

  it('matches if lookBackIndex is lower than activation key index', function () {
    const found = query('hi :cat bye :dog', ':', 16, {multiWord: true, lookBackIndex: 7})
    assert(found, {text: 'dog', position: 13})
  })
})
