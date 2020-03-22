import { object as toStyleObject } from 'to-style'
import { paramCase } from 'change-case'

export default function tdxHastToInterim(this: any, options = { singleBlock: false }) {

  this.Compiler = (tree, { contents }) => {
    return toInterim(tree, {}, options, contents, -1)
  } 

}

function toInterim(
  node: any,
  parentNode: any = {},
  options: any = {},
  contents: string,
  index: number
) {
  
  const { preserveNewlines = false } = options

  let children: any = []

  if (node.properties != null) {
    if (typeof node.properties.style === 'string') {
      node.properties.style = toStyleObject(node.properties.style, {
        camelize: true
      })
    }

    // ariaProperty => aria-property
    // dataProperty => data-property
    const paramCaseRe = /^(aria[A-Z])|(data[A-Z])/
    node.properties = Object.entries(node.properties).reduce(
      (properties, [key, value]) =>
        Object.assign({}, properties, {
          [paramCaseRe.test(key) ? paramCase(key) : key]: value
        }),
      {}
    )
  }

  if (node.type === 'root') {
    const tiniaNodes: any[] = []
  
    for (const childNode of node.children) {
      tiniaNodes.push(childNode)
    }

    const mergeMd = (item1, { src, value }, _i: number) =>
      Object.assign({}, item1, {
        src: `${item1.src}\n${src}`,
        //   value: `${item1.value}${value}`
        value: item1.value.endsWith('</>')
          ? item1.value.substr(0, item1.value.length - 3) + value + '</>'
          : '<>' + item1.value + value + '</>'
      })

    const interim = tiniaNodes.map((childNode, index) =>
    toInterim(childNode, node, options, contents, index)
    )

    const blocks: any[] = interim
      .reduce((accum, item, i, items) => {
        if (i > 0 && item.type === 'md' && items[i - 1].type === 'md') {
          accum[accum.length - 1] = mergeMd(accum[accum.length - 1], item, i)
        } else {
          accum.push(item)
        }

        return accum
      }, [])
      .filter(({ type, src }) => !(type === 'md' && src === ''))
      .map(item => {
        if (item.type === 'md') {
          item.src = item.src.replace(/^\s+|\s+$/g, '')
        }
        return item
      })

      return blocks
    
  }

  // recursively walk through children
  if (node.children) {
    children = node.children.map((childNode, tiniaNodeIndex) => {
      const childOptions = Object.assign({}, options, {
        // tell all children inside <pre> tags to preserve newlines as text nodes
        preserveNewlines: preserveNewlines || node.tagName === 'pre'
      })
      return toInterim(childNode, node, childOptions, contents, tiniaNodeIndex)
    })
  }

  if (node.type === 'element') {
    if (
      node.tagName == 'pre' &&
      children.length == 1 &&
      node.children[0].tagName == 'code'
    ) {
      if (parentNode.type === 'root') {
        const codeTag = {
          type: 'code',
          src: node.children[0].children[0].value,
          language: node.children[0].properties.language || 'javascript',
          isPinned: node.children[0].properties.pin || false
        }

        return codeTag
      } else {
        return {
          type: 'md',
          tagName: node.tagName,
          src: children[0].src,
          value: tdxToJSX(node, parentNode, options, index)
        }
      }
    } else if (node.tagName === 'code') {
      return {
        type: 'code',
        className: (node.properties.className || []).join(' '),
        src: children[0]
      }
    } else {
      return {
        type: 'md',
        tagName: node.tagName,
        src: node.position ? contents.substr(
          node.position.start.offset,
          node.position.end.offset - node.position.start.offset
        ): '',
        value: tdxToJSX(node, parentNode, options, index)
      }
    }
  }

  if (node.type === 'jsx' || node.type === 'html') {
    if (parentNode.type === 'root') {
      return { type: node.type, src: node.value }
    } else {
      return node.value
    }
  }

  // Wraps text nodes inside template string, so that we don't run into escaping issues.
  if (node.type === 'text') {
    // Don't wrap newlines unless specifically instructed to by the flag,
    // to avoid issues like React warnings caused by text nodes in tables.
    if (
      node.value === '\n' &&
      ((!preserveNewlines || parentNode.type === 'root') &&
        parentNode.tagName !== 'code')
    ) {
      if (parentNode.type === 'root') {
        return { type: 'md', src: '', value: '' }
      } else {
        return null
      }
    } else if (parentNode.type === 'root') {
      return {
        type: 'md',
        value: `{\`${node.value.replace(/`/g, '\\`')}\`}`,
        src: node.value
      }
    } else if (parentNode.tagName === 'code') {
      return node.value
    } else {
      return `{\`${node.value.replace(/`/g, '\\`')}\`}`
    }
  }

  if (node.type === 'block') {
    if (parentNode.type === 'root') {
      return {
        type: 'code',
        language: 'javascript',
        src: node.value
      }
    } else if (parentNode.tagName === 'code') {
      return node.value
    } else {
      return node.value
    }
  }

  if (node.type === 'htmlblock') {
    return node.value
  }

  if (node.type === 'comment') {
    return `{/*${node.value}*/}`
  }

  if (node.type === 'export') {
    return {
      type: node.type,
      src: node.value
    }
  }

  if (node.type === 'import') {
    return {
      type: node.type,
      src: node.value
    }
  }

  if (node.type === 'yaml') {
    return node
  }

  console.log(node)

  throw new Error('Unrecognized node type ' + node.type)
}

function tdxToJSX(
  node: any,
  parentNode: any = {},
  options: any = {},
  index: number
) {
  const {
    // default options
    preserveNewlines = false
  } = options
  let children = ''

  if (node.properties != null) {
    if (typeof node.properties.style === 'string') {
      node.properties.style = toStyleObject(node.properties.style, {
        camelize: true
      })
    }

    // ariaProperty => aria-property
    // dataProperty => data-property
    const paramCaseRe = /^(aria[A-Z])|(data[A-Z])/
    node.properties = Object.entries(node.properties).reduce(
      (properties, [key, value]) =>
        Object.assign({}, properties, {
          [paramCaseRe.test(key) ? paramCase(key) : key]: value
        }),
      {}
    )
  }

  // recursively walk through children
  if (node.children) {
    children = node.children
      .map((childNode, childindex) => {
        const childOptions = Object.assign({}, options, {
          // tell all children inside <pre> tags to preserve newlines as text nodes
          preserveNewlines: preserveNewlines || node.tagName === 'pre'
        })
        return tdxToJSX(childNode, node, childOptions, childindex)
      })
      .join('')
  }

  if (node.type === 'element') {
    let props = ''

    if (Array.isArray(node.properties.className)) {
      node.properties.className = node.properties.className.join(' ')
    }

    if (Object.keys(node.properties).length > 0) {
      props = JSON.stringify(node.properties)
    }

    return `<Md name="${node.tagName}" key={${index}} ${
      parentNode.tagName ? ` parentName="${parentNode.tagName}"` : ''
    }${props ? ` props={${props}}` : ''}>${children}</Md>`
  }

  // Wraps text nodes inside template string, so that we don't run into escaping issues.
  if (node.type === 'text') {
    // Don't wrap newlines unless specifically instructed to by the flag,
    // to avoid issues like React warnings caused by text nodes in tables.
    if (node.value === '\n' && !preserveNewlines) {
      return node.value
    }
    return `{\`${node.value.replace(/`/g, '\\`')}\`}`
  }

  // Wraps block nodes inside JSX {}
  if (node.type === 'block' || node.type === 'htmlblock') {
    return `{${node.value}}`
  }

  if (node.type === 'comment') {
    return `{/*${node.value}*/}`
  }

  if (node.type === 'html') {
    return `<Md name="html" key={${index}}>{\`${node.value.replace(
      /\`/g,
      '\\`'
    )}\`}</Md>`
  }

  if (node.type === 'import' || node.type === 'export' || node.type === 'jsx') {
    return node.value
  }
}

