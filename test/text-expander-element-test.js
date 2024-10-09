import {WrapperComponent} from './WrapperComponent'

describe('text-expander element', function () {
  describe('element creation', function () {
    it('creates from document.createElement', function () {
      const el = document.createElement('text-expander')
      assert.equal('TEXT-EXPANDER', el.nodeName)
      assert(el instanceof window.TextExpanderElement)
    })

    it('creates from constructor', function () {
      const el = new window.TextExpanderElement()
      assert.equal('TEXT-EXPANDER', el.nodeName)
    })
  })

  describe('after tree insertion', function () {
    beforeEach(function () {
      const container = document.createElement('div')
      container.innerHTML = `
        <text-expander keys=": @ [[">
          <textarea></textarea>
        </text-expander>
      `
      document.body.append(container)
    })

    afterEach(function () {
      document.body.innerHTML = ''
    })

    it('has activation keys', function () {
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

    it('dispatches change event', async function () {
      const expander = document.querySelector('text-expander')
      const input = expander.querySelector('textarea')
      const result = once(expander, 'text-expander-change')
      triggerInput(input, ':')
      const event = await result
      const {key} = event.detail
      assert.equal(':', key)
    })

    it('dismisses the menu when dismiss() is called', async function () {
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

    it('dispatches change events for 2 char activation keys', async function () {
      const expander = document.querySelector('text-expander')
      const input = expander.querySelector('textarea')

      const receivedText = []
      const expectedText = ['', 'a', 'ab', 'abc', 'abcd']

      expander.addEventListener('text-expander-change', event => {
        const {key, text} = event.detail
        assert.equal('[[', key)
        receivedText.push(text)
      })
      triggerInput(input, '[[')
      triggerInput(input, '[[a')
      triggerInput(input, '[[ab')
      triggerInput(input, '[[abc')
      triggerInput(input, '[[abcd')

      assert.deepEqual(receivedText, expectedText)
    })

    it('dispatches value event after selecting item and closes', async function () {
      const expander = document.querySelector('text-expander')
      const input = expander.querySelector('textarea')
      const menu = document.createElement('ul')
      const item = document.createElement('li')
      item.setAttribute('role', 'option')
      menu.appendChild(item)

      expander.addEventListener('text-expander-change', event => {
        const {provide} = event.detail
        provide(Promise.resolve({matched: true, fragment: menu}))
      })

      expander.addEventListener('text-expander-value', event => {
        event.detail.value = ':1'
      })

      input.focus()
      triggerInput(input, ':')
      await waitForAnimationFrame()
      assert.exists(expander.querySelector('ul'))

      const result = once(expander, 'text-expander-value')
      expander.querySelector('li').click()
      const event = await result
      assert.equal(false, event.detail.continue)

      assert.equal(input.value, ':1 ')

      await waitForAnimationFrame()
      assert.isNull(expander.querySelector('ul'))
    })

    it('dispatches value event after selecting item and keeps menu open', async function () {
      const expander = document.querySelector('text-expander')
      const input = expander.querySelector('textarea')
      const menu = document.createElement('ul')
      const item = document.createElement('li')
      item.setAttribute('role', 'option')
      menu.appendChild(item)

      expander.addEventListener('text-expander-change', event => {
        const {provide} = event.detail
        // eslint-disable-next-line no-console
        console.log('ASDFSDF', event.detail)
        provide(Promise.resolve({matched: true, fragment: menu}))
      })

      expander.addEventListener('text-expander-value', event => {
        event.detail.value = ':1'
        event.detail.continue = true
      })

      input.focus()
      triggerInput(input, ':')
      await waitForAnimationFrame()
      assert.exists(expander.querySelector('ul'))

      const result = once(expander, 'text-expander-value')
      expander.querySelector('li').click()
      const event = await result
      assert.equal(true, event.detail.continue)

      triggerInput(input, '#1', true)

      assert.equal(input.value, ':1#1')

      await waitForAnimationFrame()
      assert.exists(expander.querySelector('ul'))
    })
  })

  describe('multi-word scenarios', function () {
    beforeEach(function () {
      const container = document.createElement('div')
      container.innerHTML = `
        <text-expander keys="@ # [[" multiword="# [[">
          <textarea></textarea>
        </text-expander>
      `
      document.body.append(container)
    })

    afterEach(function () {
      document.body.innerHTML = ''
    })

    it('has activation keys', function () {
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

    it('sets keys', function () {
      const expander = document.querySelector('text-expander')
      assert.deepEqual(
        [
          {key: '@', multiWord: false},
          {key: '#', multiWord: true},
          {key: '[[', multiWord: true}
        ],
        expander.keys
      )

      expander.keys = '@ [['

      assert.deepEqual(
        [
          {key: '@', multiWord: false},
          {key: '[[', multiWord: true}
        ],
        expander.keys
      )
    })

    it('dispatches change event for multi-word', async function () {
      const expander = document.querySelector('text-expander')
      const input = expander.querySelector('textarea')
      const result = once(expander, 'text-expander-change')
      triggerInput(input, '@match #some text')
      const event = await result
      const {key, text} = event.detail
      assert.equal('#', key)
      assert.equal('some text', text)
    })

    it('dispatches change events for 2 char activation keys for multi-word', async function () {
      const expander = document.querySelector('text-expander')
      const input = expander.querySelector('textarea')

      const receivedText = []
      const expectedText = ['', 'a', 'ab', 'abc', 'abcd', 'abcd def']

      expander.addEventListener('text-expander-change', event => {
        const {key, text} = event.detail
        assert.equal('[[', key)
        receivedText.push(text)
      })
      triggerInput(input, '[[')
      triggerInput(input, '[[a')
      triggerInput(input, '[[ab')
      triggerInput(input, '[[abc')
      triggerInput(input, '[[abcd')
      triggerInput(input, '[[abcd def')

      assert.deepEqual(receivedText, expectedText)
    })

    it('dispatches change event for single word match after multi-word', async function () {
      const expander = document.querySelector('text-expander')
      const input = expander.querySelector('textarea')
      const result = once(expander, 'text-expander-change')
      triggerInput(input, '#some text @match')
      const event = await result
      const {key, text} = event.detail
      assert.equal('@', key)
      assert.equal('match', text)
    })

    it('dispatches change event for multi-word with single word inside', async function () {
      const expander = document.querySelector('text-expander')
      const input = expander.querySelector('textarea')
      const result = once(expander, 'text-expander-change')
      triggerInput(input, '#some text @match word')
      const event = await result
      const {key, text} = event.detail
      assert.equal('#', key)
      assert.equal('some text @match word', text)
    })

    it('dispatches change event for the first activation key even if it is typed again', async function () {
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

  describe('use inside a ShadowDOM', function () {
    before(function () {
      customElements.define('wrapper-component', WrapperComponent)
    })

    beforeEach(function () {
      const container = document.createElement('div')
      container.innerHTML = '<wrapper-component></wrapper-component>'
      document.body.append(container)
    })

    afterEach(function () {
      document.body.innerHTML = ''
    })

    it('show results on input', async function () {
      const component = document.querySelector('wrapper-component')
      const input = component.shadowRoot.querySelector('textarea')
      input.focus()
      triggerInput(input, '@a')
      await waitForAnimationFrame()
      assert.exists(component.shadowRoot.querySelector('ul'))
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
