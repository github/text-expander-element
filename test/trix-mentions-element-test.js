import {WrapperComponent} from './wrapper-component'

describe('trix-mentions element', function () {
  describe('element creation', function () {
    it('creates from document.createElement', function () {
      const el = document.createElement('trix-mentions')
      assert.equal('TRIX-MENTIONS', el.nodeName)
      assert(el instanceof window.TrixMentionsElement)
    })

    it('creates from constructor', function () {
      const el = new window.TrixMentionsElement()
      assert.equal('TRIX-MENTIONS', el.nodeName)
    })
  })

  describe('after tree insertion', function () {
    beforeEach(function () {
      document.body.insertAdjacentHTML(
        'afterbegin',
        `<trix-mentions keys=": @ [[">
           <trix-editor></trix-editor>
         </trix-mentions>`
      )
    })

    afterEach(function () {
      for (const element of document.body.children) element.remove()
    })

    it('has activation keys', function () {
      const expander = document.querySelector('trix-mentions')
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
      const expander = document.querySelector('trix-mentions')
      const input = expander.querySelector('trix-editor')
      const result = once(expander, 'trix-mentions-change')
      triggerInput(input, ':')
      const event = await result
      const {key} = event.detail
      assert.equal(':', key)
    })

    it('dismisses the menu when dismiss() is called', async function () {
      const expander = document.querySelector('trix-mentions')
      const input = expander.querySelector('trix-editor')
      const menu = document.createElement('ul')
      menu.appendChild(document.createElement('li'))

      expander.addEventListener('trix-mentions-change', event => {
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
      const expander = document.querySelector('trix-mentions')
      const input = expander.querySelector('trix-editor')

      const receivedText = []
      const expectedText = ['', 'a', 'ab', 'abc', 'abcd']

      expander.addEventListener('trix-mentions-change', event => {
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

    it('toggles the [role] and [aria-multiline] when expanding and dismissing the menu', async function () {
      const expander = document.querySelector('trix-mentions')
      const input = expander.querySelector('trix-editor')
      const menu = document.createElement('ul')
      menu.appendChild(document.createElement('li'))

      expander.addEventListener('trix-mentions-change', event => {
        const {provide} = event.detail
        provide(Promise.resolve({matched: true, fragment: menu}))
      })

      input.focus()
      triggerInput(input, ':')
      await waitForAnimationFrame()
      assert.equal(input.getAttribute('role'), 'combobox')
      assert.equal(input.getAttribute('aria-multiline'), 'false')

      expander.dismiss()
      await waitForAnimationFrame()
      assert.equal(input.getAttribute('role'), 'textbox')
      assert.equal(input.getAttribute('aria-multiline'), null)
    })

    describe('committing without a trix-mentions-value listener', function () {
      it('forwards the [data-trix-attachment] attribute to the Trix.Attachment instance', async function () {
        const attachmentOptions = {content: 'content override', contentType: 'ignored'}
        const expander = document.querySelector('trix-mentions')
        const input = expander.querySelector('trix-editor')
        const menu = document.createElement('ul')
        menu.role = 'listbox'
        const item = document.createElement('li')
        item.role = 'option'
        item.textContent = 'an option'
        item.setAttribute('data-trix-attachment', JSON.stringify(attachmentOptions))
        item.setAttribute('data-ignored-attribute', 'ignored')
        item.setAttribute('data-trix-attachment-content-type', 'mime')
        menu.appendChild(item)

        expander.addEventListener('trix-mentions-change', event => {
          const {provide} = event.detail
          provide(Promise.resolve({matched: true, fragment: menu}))
        })

        input.focus()
        triggerInput(input, ':')
        await waitForAnimationFrame()
        item.click()
        await waitForAnimationFrame()

        const figure = input.querySelector('figure')
        const {content, contentType} = JSON.parse(figure.getAttribute('data-trix-attachment'))
        assert.equal(item.textContent, content)
        assert.equal('mime', contentType)
        assert.equal('mime', figure.getAttribute('data-trix-content-type'))
        assert(figure.textContent.includes(item.textContent))
      })
    })
  })

  describe('multi-word scenarios', function () {
    beforeEach(function () {
      document.body.insertAdjacentHTML(
        'afterbegin',
        `<trix-mentions keys="@ # [[" multiword="# [[">
           <trix-editor></trix-editor>
         </trix-mentions>`
      )
    })

    afterEach(function () {
      for (const element of document.body.children) element.remove()
    })

    it('has activation keys', function () {
      const expander = document.querySelector('trix-mentions')
      assert.deepEqual(
        [
          {key: '@', multiWord: false},
          {key: '#', multiWord: true},
          {key: '[[', multiWord: true}
        ],
        expander.keys
      )
    })

    it('dispatches change event for multi-word', async function () {
      const expander = document.querySelector('trix-mentions')
      const input = expander.querySelector('trix-editor')
      const result = once(expander, 'trix-mentions-change')
      triggerInput(input, '@match #some text')
      const event = await result
      const {key, text} = event.detail
      assert.equal('#', key)
      assert.equal('some text', text)
    })

    it('dispatches change events for 2 char activation keys for multi-word', async function () {
      const expander = document.querySelector('trix-mentions')
      const input = expander.querySelector('trix-editor')

      const receivedText = []
      const expectedText = ['', 'a', 'ab', 'abc', 'abcd', 'abcd def']

      expander.addEventListener('trix-mentions-change', event => {
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
      const expander = document.querySelector('trix-mentions')
      const input = expander.querySelector('trix-editor')
      const result = once(expander, 'trix-mentions-change')
      triggerInput(input, '#some text @match')
      const event = await result
      const {key, text} = event.detail
      assert.equal('@', key)
      assert.equal('match', text)
    })

    it('dispatches change event for multi-word with single word inside', async function () {
      const expander = document.querySelector('trix-mentions')
      const input = expander.querySelector('trix-editor')
      const result = once(expander, 'trix-mentions-change')
      triggerInput(input, '#some text @match word')
      const event = await result
      const {key, text} = event.detail
      assert.equal('#', key)
      assert.equal('some text @match word', text)
    })

    it('dispatches change event for the first activation key even if it is typed again', async function () {
      const expander = document.querySelector('trix-mentions')
      const input = expander.querySelector('trix-editor')

      let result = once(expander, 'trix-mentions-change')
      triggerInput(input, '#step 1')
      let event = await result
      let {key, text} = event.detail
      assert.equal('#', key)
      assert.equal('step 1', text)

      await waitForAnimationFrame()

      result = once(expander, 'trix-mentions-change')
      triggerInput(input, ' #step 2', true) //<-- At this point the text inside the input field is "#step 1 #step 2"
      event = await result
      ;({key, text} = event.detail)
      assert.equal('#', key)
      assert.equal('step 1 #step 2', text)

      await waitForAnimationFrame()

      result = once(expander, 'trix-mentions-change')
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
      document.body.insertAdjacentHTML('afterbegin', '<wrapper-component></wrapper-component>')
    })

    afterEach(function () {
      for (const element of document.body.children) element.remove()
    })

    it('show results on input', async function () {
      const component = document.querySelector('wrapper-component')
      const input = component.shadowRoot.querySelector('trix-editor')
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
  const editor = input.editor
  const [, selectionEnd] = editor.getSelectedRange()
  if (onlyAppend) {
    editor.setSelectedRange([selectionEnd, selectionEnd])
    editor.insertString(value)
  } else {
    editor.setSelectedRange([0, 0])
    editor.insertString(value)
  }
  return input.dispatchEvent(new InputEvent('input'))
}

async function waitForAnimationFrame() {
  return new Promise(resolve => {
    window.requestAnimationFrame(resolve)
  })
}
