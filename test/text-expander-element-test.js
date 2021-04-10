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
        <text-expander keys=": @ [[">
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
          {key: '@', multiWord: false},
          {key: '[[', multiWord: false}
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

    it('dismisses the menu when dismiss() is called', async function() {
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

    it('dispatches change events for 2 char activation keys', async function() {
      const expander = document.querySelector('text-expander')
      const input = expander.querySelector('textarea')

      let calls = 0
      const receivedText = {}
      const expectedText = ['', 'a', 'ab', 'abc', 'abcd']

      expander.addEventListener('text-expander-change', event => {
        calls = calls + 1
        const {key, text} = event.detail
        assert.equal('[[', key)
        receivedText[text] = true
      })
      triggerInput(input, '[[')
      triggerInput(input, '[[a')
      triggerInput(input, '[[ab')
      triggerInput(input, '[[abc')
      triggerInput(input, '[[abcd')

      for (const text of expectedText) {
        assert(receivedText[text], 'expected `${text}`')
      }
      assert.equal(5, calls)
    })
  })

  describe('multi-word scenarios', function() {
    beforeEach(function() {
      const container = document.createElement('div')
      container.innerHTML = `
        <text-expander keys="@ # [[" multiword="# [[">
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
          {key: '#', multiWord: true},
          {key: '[[', multiWord: true}
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

    it('dispatches change events for 2 char activation keys for multi-word', async function() {
      const expander = document.querySelector('text-expander')
      const input = expander.querySelector('textarea')

      let calls = 0
      const receivedText = {}
      const expectedText = ['', 'a', 'ab', 'abc', 'abcd', 'abcd def']

      expander.addEventListener('text-expander-change', event => {
        calls = calls + 1
        const {key, text} = event.detail
        assert.equal('[[', key)
        receivedText[text] = true
      })
      triggerInput(input, '[[')
      triggerInput(input, '[[a')
      triggerInput(input, '[[ab')
      triggerInput(input, '[[abc')
      triggerInput(input, '[[abcd')
      triggerInput(input, '[[abcd def')

      for (const text of expectedText) {
        assert(receivedText[text], 'expected: `${text}`')
      }
      assert.equal(6, calls)
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

    it('dispatches change event for the first activation key even if it is typed again', async function() {
      const expander = document.querySelector('text-expander')
      const input = expander.querySelector('textarea')

      let result = once(expander, 'text-expander-change')
      triggerInput(input, '#step 1')
      let event = await result
      let {key, text} = event.detail
      assert.equal('#', key)
      assert.equal('step 1', text)

      await waitForAnimationFrame()

      result = once(expander, 'text-expander-change')
      triggerInput(input, ' #step 2', true) //<-- At this point the text inside the input field is "#step 1 #step 2"
      event = await result
      ;({key, text} = event.detail)
      assert.equal('#', key)
      assert.equal('step 1 #step 2', text)

      await waitForAnimationFrame()

      result = once(expander, 'text-expander-change')
      triggerInput(input, ' #step 3', true) //<-- At this point the text inside the input field is "#step 1 #step 2 #step 3"
      event = await result
      ;({key, text} = event.detail)
      assert.equal('#', key)
      assert.equal('step 1 #step 2 #step 3', text)
    })
  })
})

function once(element, eventName) {
  return new Promise(resolve => {
    element.addEventListener(eventName, resolve, {once: true})
  })
}

function triggerInput(input, value, onlyAppend = false) {
  input.value = onlyAppend ? input.value + value : value
  return input.dispatchEvent(new InputEvent('input'))
}

async function waitForAnimationFrame() {
  return new Promise(resolve => {
    window.requestAnimationFrame(resolve)
  })
}
