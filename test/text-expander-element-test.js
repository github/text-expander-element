describe('text-expander element', function() {
  describe('element creation', function() {
    it('creates from document.createElement', function() {
      const el = document.createElement('text-expander')
      assert.equal('TEXT-EXPANDER', el.nodeName)
      assert(el instanceof window.TextExpanderElement)
    })

    it('creates from constructor', function() {
      const el = new window.TextExpanderElement()
      assert.equal('TEXT-EXPANDER', el.nodeName)
    })
  })

  describe('after tree insertion', function() {
    beforeEach(function() {
      const container = document.createElement('div')
      container.innerHTML = `
        <text-expander keys=": @">
          <textarea></textarea>
        </text-expander>
      `
      document.body.append(container)
    })

    afterEach(function() {
      document.body.innerHTML = ''
    })

    it('has activation keys', function() {
      const expander = document.querySelector('text-expander')
      assert.deepEqual([':', '@'], expander.keys)
    })

    it('dispatches change event', async function() {
      const expander = document.querySelector('text-expander')
      const input = expander.querySelector('textarea')
      const result = once(expander, 'text-expander-change')
      triggerInput(input, ':')
      const event = await result
      const {key} = event.detail
      assert.equal(':', key)
    })
  })
})

function once(element, eventName) {
  return new Promise(resolve => {
    element.addEventListener(eventName, resolve, {once: true})
  })
}

function triggerInput(input, value) {
  input.value = value
  return input.dispatchEvent(new InputEvent('input'))
}
