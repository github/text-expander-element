import textFieldMirror from '../dist/text-field-mirror'

function textareaContentsHeight(textarea) {
  const {mirror} = textFieldMirror(textarea)
  mirror.style.height = ''
  const height = parseInt(window.getComputedStyle(mirror).height, 10)

  setTimeout(() => {
    const ref = mirror.parentNode

    if (ref != null) {
      return ref.removeChild(mirror)
    } else {
      return null
    }
  }, 5000)

  return height
}

describe('textareaContentsHeight', function () {
  let field

  beforeEach(function () {
    document.body.innerHTML = `
      <trix-editor style="height: 40px; width: 395px;"></trix-editor>
    `
    field = document.querySelector('trix-editor')
  })

  afterEach(function () {
    document.body.innerHTML = ''
  })

  const slipsum = `
Lorem ipsum dolor sit amet, id vel assum aeterno fierent. Ad ipsum expetendis vis. Pro constituto quaerendum eu, at insolens iracundia eos. Cu causae singulis ius, appetere postulant ne est. Eum an quando perfecto, impetus euismod id his, tantas definitiones in eos. In his denique suscipiantur, vim te decore laudem nullam, mel quod accommodare ad.

Duo id facer facete nonumes, vim no accusata dissentiet. Cum paulo delectus platonem no. Mea in latine virtute theophrastus, te minim blandit per. Vel idque homero in, vix scripta pertinax ea, eu ius delenit commune pertinacia. Noluisse voluptua invidunt ea his, id has graece maiestatis complectitur, vix cetero officiis apeirian te. Ut velit epicurei duo, vel possim aeterno convenire ei.
`

  it('height of empty textarea', function () {
    assert.equal(0, textareaContentsHeight(field))
  })

  it('height of single line textarea', function () {
    field.value = 'Hello, World!'
    const height = textareaContentsHeight(field)
    assert.ok(13 <= height && height <= 21, height)
  })

  it('height of multiline textarea', function () {
    field.value = slipsum
    const height = textareaContentsHeight(field)
    assert.ok(150 <= height && height <= 400, height)
  })
})
