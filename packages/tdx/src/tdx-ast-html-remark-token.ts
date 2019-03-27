const lessThan = '<'
const questionMark = '?'
const exclamationMark = '!'
const slash = '/'
const greaterThan = '>'

const attributeName = '[a-zA-Z_:][a-zA-Z0-9:._-]*'
const unquoted = '[^"\'=<>`\\u0000-\\u0020]+'
const singleQuoted = "'[^']*'"
const doubleQuoted = '"[^"]*"'
const attributeValue =
  '(?:' + unquoted + '|' + singleQuoted + '|' + doubleQuoted + ')'
const attribute =
  '(?:\\s+' + attributeName + '(?:\\s*=\\s*' + attributeValue + ')?)'

const openTag = '<[A-Za-z][A-Za-z0-9\\-.]*' + attribute + '*\\s*\\/?>'
const closeTag = '<\\/[A-Za-z][A-Za-z0-9\\-.]*\\s*>'
const comment = '<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->'
const processing = '<[?].*?[?]>'
const declaration = '<![A-Za-z]+\\s+[^>]*>'
const cdata = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>'
const fragment = '</?>'

const tag = new RegExp(
  '^(?:' +
  openTag +
  '|' +
  closeTag +
  '|' +
  fragment +
  '|' +
  comment +
  '|' +
  processing +
  '|' +
  declaration +
  '|' +
  cdata +
  ')'
)

var tagVoidElement = /^<(?:input|img|br|wbr|hr|area|base|col|embed|keygen|link|meta|param|source|track)/

/* Check if the given character code, or the character
 * code at the first character, is alphabetical. */
function alphabetical(character) {
  var code = typeof character === 'string' ? character.charCodeAt(0) : character

  return (
    (code >= 97 && code <= 122) /* a-z */ ||
    (code >= 65 && code <= 90) /* A-Z */
  )
}

export default function greedyHtml(
  this: any,
  eat: Function,
  value: string,
  silent: boolean
) {
  var length = value.length
  var character
  var subvalue

  if (value.charAt(0) !== lessThan || length < 3) {
    return
  }

  character = value.charAt(1)

  if (
    !alphabetical(character) &&
    character !== slash &&
    character !== greaterThan &&
    character !== questionMark &&
    character !== exclamationMark
  ) {
    return
  }

  subvalue = value.match(tag)

  if (!subvalue) {
    return
  }

  /* istanbul ignore if - not used yet. */
  if (silent) {
    return true
  }

  subvalue = _getHtml(value)

  return eat(subvalue)({ type: 'html', value: subvalue })
}

const tagRegExp = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])*>/g

function _getHtml(html: string) {
  let result: string[] = []
  let level = -1
  let breakout = false

  html.replace(tagRegExp, function (tag: string, index) {
    if (breakout) {
      return
    }

    result.push(tag)

    var isOpen = tag.charAt(1) !== '/'
    var isVoid = false
    var nextStart = index + tag.length
    var nextChar = html.charAt(nextStart)

    if (isOpen) {
      level++

      if (tag.charAt(tag.length - 2) === '/' || tagVoidElement.test(tag)) {
        isVoid = true
      }

      if (!isVoid && nextChar && nextChar !== '<') {
        let nextStartAfterText = html.indexOf('<', nextStart)
        if (!nextStartAfterText) {
          throw new Error('Missing closing tag for ' + tag)
        }

        result.push(html.slice(nextStart, nextStartAfterText))
      }
    }

    if (!isOpen || isVoid) {
      level--
      if (nextChar !== '<' && nextChar) {
        if (level === -1) {
          breakout = true
          return
        }

        let nextStartAfterText = html.indexOf('<', nextStart)
        var content = html.slice(
          nextStart,
          nextStartAfterText === -1 ? undefined : nextStartAfterText
        )
        // note: even if a node is nothing but whitespace, stil need to add it, to match eat
        result.push(content)
      }
    }
  } as any)

  return result.join('')
}

greedyHtml.locator = (value, fromIndex) => {
  return value.indexOf('<', fromIndex)
}
