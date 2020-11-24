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
      assert.deepEqual(
        [
          {key: ':', multiWord: false},
          {key: '@', multiWord: false}
        ],
        expander.keys
      )
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

    it('Escape dismisses the menu', async function() {
      const expander = document.querySelector('text-expander')
      const input = expander.querySelector('textarea')
      const menu = document.createElement('ul')
      menu.appendChild(document.createElement('li'))

      expander.addEventListener('text-expander-change', event => {
        const {provide} = event.detail
        provide(Promise.resolve({matched: true, fragment: menu}))
      })

      input.focus()
      triggerInput(input, ':')
      await waitForAnimationFrame()
      assert.exists(expander.querySelector('ul'))

      expander.dismiss()
      await waitForAnimationFrame()
      assert.isNull(expander.querySelector('ul'))
    })
  })

  describe('multi-word scenarios', function() {
    beforeEach(function() {
      const container = document.createElement('div')
      container.innerHTML = `
        <text-expander keys="@ #" multiword="#">
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
      assert.deepEqual(
        [
          {key: '@', multiWord: false},
          {key: '#', multiWord: true}
        ],
        expander.keys
      )
    })

    it('dispatches change event for multi-word', async function() {
      const expander = document.querySelector('text-expander')
      const input = expander.querySelector('textarea')
      const result = once(expander, 'text-expander-change')
      triggerInput(input, '@match #some text')
      const event = await result
      const {key, text} = event.detail
      assert.equal('#', key)
      assert.equal('some text', text)
    })

    it('dispatches change event for single word match after multi-word', async function() {
      const expander = document.querySelector('text-expander')
      const input = expander.querySelector('textarea')
      const result = once(expander, 'text-expander-change')
      triggerInput(input, '#some text @match')
      const event = await result
      const {key, text} = event.detail
      assert.equal('@', key)
      assert.equal('match', text)
    })

    it('dispatches change event for multi-word with single word inside', async function() {
      const expander = document.querySelector('text-expander')
      const input = expander.querySelector('textarea')
      const result = once(expander, 'text-expander-change')
      triggerInput(input, '#some text @match word')
      const event = await result
      const {key, text} = event.detail
      assert.equal('#', key)
      assert.equal('some text @match word', text)
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

async function waitForAnimationFrame() {
  return new Promise(resolve => {
    window.requestAnimationFrame(resolve)
  })
}
