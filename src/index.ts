import TrixMentionsElement from './trix-mentions-element'
export {TrixMentionsElement as default}

declare global {
  interface Window {
    TrixMentionsElement: typeof TrixMentionsElement
  }
}

if (!window.customElements.get('trix-mentions')) {
  window.TrixMentionsElement = TrixMentionsElement
  window.customElements.define('trix-mentions', TrixMentionsElement)
}
