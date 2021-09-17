export class WrapperComponent extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({mode: 'open'})
    const textExpander = document.createElement('text-expander')
    textExpander.setAttribute('keys', '@')
    const textarea = document.createElement('textarea')
    textExpander.append(textarea)
    shadow.appendChild(textExpander)
  }

  connectedCallback() {
    const textExpander = this.shadowRoot.querySelector('text-expander')
    textExpander.addEventListener('text-expander-change', function (event) {
      const {key, provide} = event.detail

      if (key !== '@') return

      const suggestions = document.createElement('ul')
      suggestions.innerHTML = `
        <li role="option" data-value="a">a</li>
        <li role="option" data-value="aa">aa</li>
      `
      provide(Promise.resolve({matched: true, fragment: suggestions}))
    })
  }
}
