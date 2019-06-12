# &lt;text-expander&gt; element

Activates a suggestion menu to expand text snippets as you type.

## Installation

```
$ npm install --save @github/text-expander-element
```

## Usage

```js
import '@github/text-expander-element'
```

```html
<text-expander keys=": @ #">
  <textarea></textarea>
</text-expander>
```

## Attributes

- `keys` is a space separated list of menu activation keys

## Events

```js
const expander = document.querySelector('text-expander')

expander.addEventListener('text-expander-change', function(event) {
  const {key, provide} = event.detail
  if (key === ':') {
    const menu = document.createElement('ul')
    const item = document.createElement('li')
    item.textContent = '🐈'
    item.role = 'option'
    menu.append(item)
    provide(Promise.resolve({matched: true, fragment: menu}))
  }
})

expander.addEventListener('text-expander-value', function(event) {
  const {key, item}  = event.detail
  if (key === ':') {
    event.detail.value = '🐈'
  }
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
