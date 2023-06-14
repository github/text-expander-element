# &lt;text-expander&gt; element

Activates a suggestion menu to expand text snippets as you type.

## Installation

```
$ npm install --save @github/text-expander-element
```

## Usage

### Script

Import as ES modules:

```js
import '@github/text-expander-element'
```

With a script tag:

```html
<script type="module" src="./node_modules/@github/text-expander-element/dist/bundle.js">
```

### Markup

```html
<text-expander keys=": @ #" multiword="#">
  <textarea></textarea>
</text-expander>
```

## Attributes

- `keys` is a space separated list of menu activation keys
- `multiword` defines whether the expansion should use several words or not
  - you can provide a space separated list of activation keys that should support multi-word matching
- `suffix` is a string that is appended to the value during expansion, default is a single space character

## Events

**`text-expander-change`** is fired when a key is matched. In `event.detail` you can find:

- `key`: The matched key; for example: `:`.
- `text`: The matched text; for example: `cat`, for `:cat`.
  - If the `key` is specified in the `multiword` attribute then the matched text can contain multiple words; for example `cat and dog` for `:cat and dog`.
- `provide`: A function to be called when you have the menu results. Takes a `Promise` with `{matched: boolean, fragment: HTMLElement}` where `matched` tells the element whether a suggestion is available, and `fragment` is the menu content to be displayed on the page.

```js
const expander = document.querySelector('text-expander')

expander.addEventListener('text-expander-change', function(event) {
  const {key, provide, text} = event.detail
  if (key !== ':') return

  const suggestions = document.querySelector('.emoji-suggestions').cloneNode(true)
  suggestions.hidden = false
  for (const suggestion of suggestions.children) {
    if (!suggestion.textContent.match(text)) {
      suggestion.remove()
    }
  }
  provide(Promise.resolve({matched: suggestions.childElementCount > 0, fragment: suggestions}))
})
```

The returned fragment should be consisted of filtered `[role=option]` items to be selected. For example:

```html
<ul class="emoji-suggestions" hidden>
  <li role="option" data-value="🐈">🐈 :cat2:</li>
  <li role="option" data-value="🐕">🐕 :dog:</li>
</ul>
```

**`text-expander-value`** is fired when an item is selected. In `event.detail` you can find:

- `key`: The matched key; for example: `:`.
- `item`: The selected item. This would be one of the `[role=option]`. Use this to work out the `value`.
- `value`: A null value placeholder to replace the query. To replace the text query, simply re-assign this value.
- `continue`: A boolean value to specify whether to continue autocompletion after inserting a value. Defaults to `false`. If set to `true`, will not add a space after inserted value and will keep firing the `text-expander-change` event.

```js
const expander = document.querySelector('text-expander')

expander.addEventListener('text-expander-value', function(event) {
  const {key, item}  = event.detail
  if (key === ':') {
    event.detail.value = item.getAttribute('data-value')
  }
})
```

**`text-expander-committed`** is fired after the underlying `input` value has been updated in the DOM. In `event.detail` you can find:

- `input`: The `HTMLInputElement` or `HTMLTextAreaElement` that just had `value` changes committed to the DOM.

```js
const expander = document.querySelector('text-expander')

expander.addEventListener('text-expander-committed', function(event) {
  const {input}  = event.detail
})
```

## Browser support

Browsers without native [custom element support][support] require a [polyfill][].

- Chrome
- Firefox
- Safari
- Microsoft Edge

[support]: https://caniuse.com/#feat=custom-elementsv1
[polyfill]: https://github.com/webcomponents/custom-elements

## Development

```
npm install
npm test
```

## License

Distributed under the MIT license. See LICENSE for details.
