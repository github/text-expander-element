export default class TextExpanderElement extends HTMLElement {
  readonly keys: Array<string>;
}

declare global {
  interface Window {
    TextExpanderElement: typeof TextExpanderElement
  }
  interface HTMLElementTagNameMap {
    'text-expander': TextExpanderElement
  }
}