export default function compiler(this: any, options = { singleBlock: false }) {
  if (options.singleBlock) {
    const _toTiniaNotebookPage = this.Compiler

    this.Compiler = (tree, file) => {
      const notebook = _toTiniaNotebookPage(tree, file)
      return collapseToSingleBlock(notebook, options)
    }
  }
}

function collapseToSingleBlock(
  notebook: any,
  options: any
): any {
  
  if (!options.singleBlock) {
    return notebook
  }

  if (notebook.blocks.length == 1) {
    return notebook.blocks[0]
  }

  const result = notebook.blocks.reduce(
    (accum, { src, transpiled, type, language }, key) => {
      let value = transpiled.value

      let addValue

      if (type == 'import' || type == 'export') {
        addValue = `<Md name='pre' key={${key}}><Md name='code' props={{ className : "${language!
          .split(' ')
          .map(l => 'language-javascript' + l)
          .join(' ')}"}}>{\`${src}\`}</Md></Md>`
      } else if (type == 'code') {
        addValue = `<Md name='pre' key={${key}}><Md name='code' props={{ className : "${language!
          .split(' ')
          .map(l => 'language-' + l)
          .join(' ')}"}}>{\`${src}\`}</Md></Md>`
      } else if (type == 'md') {
        addValue = `<React.Fragment key={${key}}>${value}</React.Fragment>`
      }
      if (type == 'html') {
        addValue = `<Md name="html" key={${key}}>{\`${src.replace(
          /\`/g,
          '\\`'
        )}\`}</Md>`
      } else {
        addValue = `<React.Fragment key={${key}}>${src}</React.Fragment>`
      }

      return Object.assign(accum, {
        transpiled: { value: accum.transpiled.value + addValue }
      })
    },
    {
      transpiled: {
        value:
          Object.keys(notebook.meta).length > 1
            ? [
                `<pre key={'meta'}><code>${JSON.stringify(
                  notebook.meta,
                  null,
                  2
                )}</code></pre>\n`
              ]
            : ''
      }
    }
  )

  result.transpiled.value = '<>' + result.transpiled.value + '</>'

  return Object.assign(notebook.blocks[0], result)
}
