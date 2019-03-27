const {getOptions} = require('loader-utils')
const tdx = require('@tinia/tdx').default
//const tdx = require('@mdx-js/mdx')

module.exports = async function(content) {
  const callback = this.async()
  const options = Object.assign({}, getOptions(this), {
    filepath: this.resourcePath
  })
  let result

  try {
    result = await tdx(content, options)
  } catch (err) {
    return callback(err)
  }

  const code = `import React from 'react'
  import { TDXTag as Md } from '@tinia/tdx-tag'
  import { useSiteData as useEnv } from '@bestatic/components'

  ${result}
  `

  return callback(null, code)
}
//import { TDXTag as Md } from '@tinia/tdx-tag'
//import { MDXTag as Md } from '@mdx-js/tag'