import toHAST from 'mdast-util-to-hast'
import detab from 'detab'
import u from 'unist-builder'

export default function tdxAstToTdxHast() {
  return (tree, _file) => {
    const handlers = {
      // `inlineCode` gets passed as `code` by the HAST transform.
      // This makes sure it ends up being `inlineCode`
      inlineCode(_h, node) {
        return Object.assign({}, node, {
          type: 'element',
          tagName: 'inlineCode',
          properties: {},
          children: [
            {
              type: 'text',
              value: node.value
            }
          ]
        })
      },
      code(h, node) {
        const langRegex = /^[^ \t]+(?=[ \t]|$)/
        const value = node.value ? detab(`${node.value}`) : ''
        const lang = node.lang && node.lang.match(langRegex)
        const props: any = {}

        if (lang) {
          props.className = [`language-${lang}`]
          props.language = lang.toString()
        }

        props.metastring = node.meta || undefined

        const meta =
          node.meta &&
          node.meta.split(' ').reduce((acc, cur) => {
            if (cur.split('=').length > 1) {
              const t = cur.split('=')
              acc[t[0]] = t[1]
              return acc
            }
            acc[cur] = true
            return acc
          }, {})

        if (meta) {
          Object.keys(meta).forEach(key => {
            props[key] = meta[key]
          })
        }

        return h(node.position, 'pre', [
          h(node, 'code', props, [u('text', value)])
        ])
      },
      import(_h, node) {
        return Object.assign({}, node, {
          type: 'import'
        })
      },
      export(_h, node) {
        return Object.assign({}, node, {
          type: 'export'
        })
      },
      block(_h, node) {
        return Object.assign({}, node, {
          type: 'block'
        })
      },
      comment(_h, node) {
        return Object.assign({}, node, {
          type: 'comment'
        })
      },
      jsx(_h, node) {
        return Object.assign({}, node, {
          type: 'jsx'
        })
      },
      html(_h, node) {
        return Object.assign({}, node, {
          type: 'html'
        })
      },
      yaml(_h, node) {
        return Object.assign({}, node, {
          type: 'yaml',
          props: node.value.split('\n').reduce((accum, x) => {
            let parts = x.split(/:(.+)/)
            return Object.assign(
              {},
              { [parts[0].trim()]: parts[1].trim() },
              accum
            )
          }, {})
        })
      }
    }

    const hast = toHAST(tree, {
      handlers
    })

    return hast
  }
}
