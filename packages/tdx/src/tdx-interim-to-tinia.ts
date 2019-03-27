export default function compiler(this: any, options = { singleBlock: false }) {

  const _toInterim = this.Compiler

  this.Compiler = (tree, file) => {
    const interim = _toInterim(tree, file)
    return toTinia(interim, options)
  }

}

function toTinia(
  interim: any,
  options: any = {}
) {
    const tiniaMeta: any = {}

    const blocks: any[] = interim
      .map((item) => {
        if (item.type == 'yaml') {
          Object.assign(tiniaMeta, item.props)
          return false
        } 
        return item
      })
      .filter(Boolean)
      .map((item, i) => ({
        id: ('00000'+i).slice(-5),
        src: item.src,
        type: item.type,
        language: item.language,
        isPinned: item.isPinned,
        transpiled: { value: item.value },
        shadows: [],
        uiSeq: i
      }))

    const notebook = {
      bookmeta: { version: '1.0.0' },
      meta: tiniaMeta,
      blocks
    }

    return notebook
    
}

