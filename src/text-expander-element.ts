import Combobox from '@github/combobox-nav'
import query from './query'
import textFieldSelectionPosition from './text-field-selection-position'

type Match = {
  text: string
  key: string
  position: number
}

type Result = {
  fragment: HTMLElement
  matched: boolean
}

type Key = {
  key: string
  multiWord: boolean
}

const states = new WeakMap()

class TextExpander {
  expander: TextExpanderElement
  input: HTMLInputElement | HTMLTextAreaElement
  menu: HTMLElement | null
  oninput: (event: Event) => void
  onkeydown: (event: KeyboardEvent) => void
  onpaste: (event: Event) => void
  oncommit: (event: Event) => void
  onblur: (event: Event) => void
  onmousedown: (event: Event) => void
  combobox: Combobox | null
  match: Match | null
  justPasted: boolean
  lookBackIndex: number
  interactingWithList: boolean

  constructor(expander: TextExpanderElement, input: HTMLInputElement | HTMLTextAreaElement) {
    this.expander = expander
    this.input = input
    this.combobox = null
    this.menu = null
    this.match = null
    this.justPasted = false
    this.lookBackIndex = 0
    this.oninput = this.onInput.bind(this)
    this.onpaste = this.onPaste.bind(this)
    this.onkeydown = this.onKeydown.bind(this)
    this.oncommit = this.onCommit.bind(this)
    this.onmousedown = this.onMousedown.bind(this)
    this.onblur = this.onBlur.bind(this)
    this.interactingWithList = false
    input.addEventListener('paste', this.onpaste)
    input.addEventListener('input', this.oninput)
    ;(input as HTMLElement).addEventListener('keydown', this.onkeydown)
    input.addEventListener('blur', this.onblur)
  }

  destroy() {
    this.input.removeEventListener('paste', this.onpaste)
    this.input.removeEventListener('input', this.oninput)
    ;(this.input as HTMLElement).removeEventListener('keydown', this.onkeydown)
    this.input.removeEventListener('blur', this.onblur)
  }

  dismissMenu() {
    if (this.deactivate()) {
      this.lookBackIndex = this.input.selectionEnd || this.lookBackIndex
    }
  }

  private activate(match: Match, menu: HTMLElement) {
    if (this.input !== document.activeElement && this.input !== document.activeElement?.shadowRoot?.activeElement) {
      return
    }

    this.deactivate()
    this.menu = menu

    if (!menu.id) menu.id = `text-expander-${Math.floor(Math.random() * 100000).toString()}`
    this.expander.append(menu)
    this.combobox = new Combobox(this.input, menu)

    const {top, left} = textFieldSelectionPosition(this.input, match.position)
    menu.style.top = `${top}px`
    menu.style.left = `${left}px`

    this.combobox.start()
    menu.addEventListener('combobox-commit', this.oncommit)
    menu.addEventListener('mousedown', this.onmousedown)

    // Focus first menu item.
    this.combobox.navigate(1)
  }

  private deactivate() {
    const menu = this.menu
    if (!menu || !this.combobox) return false
    this.menu = null

    menu.removeEventListener('combobox-commit', this.oncommit)
    menu.removeEventListener('mousedown', this.onmousedown)

    this.combobox.destroy()
    this.combobox = null
    menu.remove()

    return true
  }

  private onCommit({target}: Event) {
    const item = target
    if (!(item instanceof HTMLElement)) return
    if (!this.combobox) return

    const match = this.match
    if (!match) return

    const beginning = this.input.value.substring(0, match.position - match.key.length)
    const remaining = this.input.value.substring(match.position + match.text.length)

    const detail = {item, key: match.key, value: null}
    const canceled = !this.expander.dispatchEvent(new CustomEvent('text-expander-value', {cancelable: true, detail}))
    if (canceled) return

    if (!detail.value) return
    const value = `${detail.value} `

    this.input.value = beginning + value + remaining

    const cursor = beginning.length + value.length

    this.deactivate()
    this.input.focus({
      preventScroll: true
    })

    this.input.selectionStart = cursor
    this.input.selectionEnd = cursor
    this.lookBackIndex = cursor
    this.match = null
  }

  private onBlur() {
    if (this.interactingWithList) {
      this.interactingWithList = false
      return
    }

    this.deactivate()
  }

  private onPaste() {
    this.justPasted = true
  }

  async onInput() {
    if (this.justPasted) {
      this.justPasted = false
      return
    }

    const match = this.findMatch()
    if (match) {
      this.match = match
      const menu = await this.notifyProviders(match)

      // Text was cleared while waiting on async providers.
      if (!this.match) return

      if (menu) {
        this.activate(match, menu)
      } else {
        this.deactivate()
      }
    } else {
      this.match = null
      this.deactivate()
    }
  }

  findMatch(): Match | void {
    const cursor = this.input.selectionEnd || 0
    const text = this.input.value
    if (cursor <= this.lookBackIndex) {
      this.lookBackIndex = cursor - 1
    }
    for (const {key, multiWord} of this.expander.keys) {
      const found = query(text, key, cursor, {
        multiWord,
        lookBackIndex: this.lookBackIndex,
        lastMatchPosition: this.match ? this.match.position : null
      })
      if (found) {
        return {text: found.text, key, position: found.position}
      }
    }
  }

  async notifyProviders(match: Match): Promise<HTMLElement | void> {
    const providers: Array<Promise<Result> | Result> = []
    const provide = (result: Promise<Result> | Result) => providers.push(result)
    const canceled = !this.expander.dispatchEvent(
      new CustomEvent('text-expander-change', {cancelable: true, detail: {provide, text: match.text, key: match.key}})
    )
    if (canceled) return

    const all = await Promise.all(providers)
    const fragments = all.filter(x => x.matched).map(x => x.fragment)
    return fragments[0]
  }

  private onMousedown() {
    this.interactingWithList = true
  }

  private onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.match = null
      if (this.deactivate()) {
        this.lookBackIndex = this.input.selectionEnd || this.lookBackIndex
        event.stopImmediatePropagation()
        event.preventDefault()
      }
    }
  }
}
export default class TextExpanderElement extends HTMLElement {
  get keys(): Key[] {
    const keysAttr = this.getAttribute('keys')
    const keys = keysAttr ? keysAttr.split(' ') : []

    const multiWordAttr = this.getAttribute('multiword')
    const multiWord = multiWordAttr ? multiWordAttr.split(' ') : []
    const globalMultiWord = multiWord.length === 0 && this.hasAttribute('multiword')

    return keys.map(key => ({key, multiWord: globalMultiWord || multiWord.includes(key)}))
  }

  connectedCallback(): void {
    const input = this.querySelector('input[type="text"], textarea')
    if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) return
    const state = new TextExpander(this, input)
    states.set(this, state)
  }

  disconnectedCallback(): void {
    const state: TextExpander = states.get(this)
    if (!state) return
    state.destroy()
    states.delete(this)
  }

  dismiss(): void {
    const state: TextExpander = states.get(this)
    if (!state) return
    state.dismissMenu()
  }
}
