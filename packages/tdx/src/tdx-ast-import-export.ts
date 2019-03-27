export default function remarkImportExport(this: any) {
  const Parser = this.Parser
  const tokenizers = Parser.prototype.blockTokenizers
  const methods = Parser.prototype.blockMethods

  tokenizers.esSyntax = tokenizeEsSyntax

  methods.splice(methods.indexOf('paragraph'), 0, 'esSyntax')
}

const tokenizeEsSyntax = (eat, value) => {
  const index = value.indexOf(EMPTY_NEWLINE)
  const subvalue = index !== -1 ? value.slice(0, index) : value

  if (isExport(subvalue) || isImport(subvalue)) {
    return eat(subvalue)({
      type: isExport(subvalue) ? 'export' : 'import',
      default: isExportDefault(subvalue),
      value: subvalue
    })
  }
}

tokenizeEsSyntax.locator = (value, _fromIndex) =>
  isExport(value) || isImport(value) ? -1 : 1

const IMPORT_REGEX = /^import/
const EXPORT_REGEX = /^export/
const EXPORT_DEFAULT_REGEX = /^export default/
const EMPTY_NEWLINE = '\n\n'

function isImport(text) {
  return IMPORT_REGEX.test(text)
}

function isExport(text) {
  return EXPORT_REGEX.test(text)
}

function isExportDefault(text) {
  return EXPORT_DEFAULT_REGEX.test(text)
}
