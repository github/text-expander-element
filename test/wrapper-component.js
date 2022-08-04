export class WrapperComponent extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({mode: 'open'})
    const trixMentionExpander = document.createElement('trix-mentions')
    trixMentionExpander.setAttribute('keys', '@')
    const trixEditor = document.createElement('trix-editor')
    trixMentionExpander.append(trixEditor)
    shadow.appendChild(trixMentionExpander)
  }

  connectedCallback() {
    const trixMentionExpander = this.shadowRoot.querySelector('trix-mentions')
    trixMentionExpander.addEventListener('trix-mentions-change', function (event) {
      const {key, provide} = event.detail

      if (key !== '@') return

      const suggestions = document.createElement('ul')
      suggestions.insertAdjacentHTML(
        'afterbegin',
        `<li role="option" data-value="a">a</li>
         <li role="option" data-value="aa">aa</li>`
      )
      provide(Promise.resolve({matched: true, fragment: suggestions}))
    })
  }
}
