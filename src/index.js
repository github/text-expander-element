/* @flow strict */

import TextExpanderElement from './text-expander-element'
export {TextExpanderElement as default}

if (!window.customElements.get('text-expander')) {
  window.TextExpanderElement = TextExpanderElement
  window.customElements.define('text-expander', TextExpanderElement)
}
