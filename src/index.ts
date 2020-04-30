import TextExpanderElement from './text-expander-element'
export {TextExpanderElement as default}

declare global {
  interface Window {
    TextExpanderElement: typeof TextExpanderElement
  }
}

if (!window.customElements.get('text-expander')) {
  window.TextExpanderElement = TextExpanderElement
  window.customElements.define('text-expander', TextExpanderElement)
}
