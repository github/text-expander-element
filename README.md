# &lt;trix-mentions&gt; element

Activates a suggestion menu to expand text snippets as you type.

Inspired by [@github/text-expander-element][].

[@github/text-expander-element]: https://github.com/github/text-expander-element

## Installation

```
$ npm install --save @thoughtbot/trix-mentions-element
```

## Usage

### Script

Import as ES modules:

```js
import '@thoughtbot/trix-mentions-element'
```

With a script tag:

```html
<script type="module" src="./node_modules/@thoughtbot/trix-mentions-element/dist/bundle.js">
```

### Markup

```html
<trix-mentions keys="@ #" multiword="#">
  <trix-editor></trix-editor>
</trix-mentions>
```

## Attributes

- `keys` is a space separated list of menu activation keys
- `multiword` defines whether the expansion should use several words or not
  - you can provide a space separated list of activation keys that should support multi-word matching

## Events

**`trix-mentions-change`** is fired when a key is matched. In `event.detail` you can find:

- `key`: The matched key; for example: `@`.
- `text`: The matched text; for example: `cat`, for `@cat`.
  - If the `key` is specified in the `multiword` attribute then the matched text can contain multiple words; for example `cat and dog` for `@cat and dog`.
- `provide`: A function to be called when you have the menu results. Takes a `Promise` with `{matched: boolean, fragment: HTMLElement}` where `matched` tells the element whether a suggestion is available, and `fragment` is the menu content to be displayed on the page.

```js
const expander = document.querySelector('trix-mentions')

expander.addEventListener('trix-mentions-change', function(event) {
  const {key, provide, text} = event.detail
  if (key !== '@') return

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

The returned fragment should be consisted of filtered `[role=option]` items to
be selected. Any attribute whose name it prefixed by `data-trix-attachment-`
will transformed into camelCase and used to create a [Trix.Attachment][]
instance under the hood. For example:

```html
<ul class="emoji-suggestions" hidden>
  <li role="option" data-trix-attachment-content="🐈"
                    data-trix-attachment-content-type="application/vnd.my-application.mention">
    🐈 @cat2
  </li>
  <li role="option" data-trix-attachment-content="🐕"
                    data-trix-attachment-content-type="application/vnd.my-application.mention">
    🐕 @dog
  </li>
</ul>
```

Alternatively, `Trix.Attachment` options can be serialized into a JSON object
and encoded into a single `[data-trix-attchment]` attribute. Additional
`data-trix-attachment-` prefixed attributes will be merged in as overrides.

When the `Trix.Attachment` options are missing a `content` key, the selected
`[role="option"]` element's [innerHTML][] will serve as the `content:` value.

[Trix.Attachment]: https://github.com/basecamp/trix/tree/1.3.1#inserting-a-content-attachment
[innerHTML]: https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML

**`trix-mentions-value`** is fired when an item is selected. In `event.detail` you can find:

- `key`: The matched key; for example: `@`.
- `item`: The selected item. This would be one of the `[role=option]`. Use this to work out the `value`.
- `value`: A null value placeholder to replace the query. To replace the query text, re-assign this value.

```js
const expander = document.querySelector('trix-mentions')

expander.addEventListener('trix-mentions-value', function(event) {
  const {key, item}  = event.detail
  if (key === '@') {
    const contentType = item.getAttribute('data-trix-attachment-content-type')
    const content = item.getAttribute('data-trix-attachment-content')

    event.detail.value = {content, contentType}
  }
})
```

Often times, when `[role="option"]` elements encode the `Trix.Attachment`
arguments into their `data-trix-attachment`-prefixed attributes,
`trix-mentions-value` event listeners can be omitted entirely.

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
