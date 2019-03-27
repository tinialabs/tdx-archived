import { WorkFlowContext, File, Plugin } from 'fuse-box'
const tdx = require('@tinia/tdx')

export interface MDXPluginOptions {
  mdPlugins?: any[]
  hastPlugins?: any[]
}

export class FuseBoxMDXPlugin implements Plugin {
  public test: RegExp = /\.(md|mdx)$/

  public options: MDXPluginOptions = {
    mdPlugins: [],
    hastPlugins: []
  }

  constructor(opts: MDXPluginOptions = {}) {
    this.options = Object.assign(this.options, opts)
  }

  public init(context: WorkFlowContext) {
    context.allowExtension('.md')
    context.allowExtension('.mdx')
    context.allowExtension('.tdx')
  }

  public async transform(file: File) {
    const context = file.context

    if (context.useCache) {
      if (file.loadFromCache()) {
        return
      }
    }

    file.loadContents()

    const result = await tdx(file.contents, this.options)

    file.contents = `
  import React from 'react'
  import { TDXTag as Md } from '@tinia/tdx-tag'
  import { useSiteData as useEnv } from '@bestatic/components'
    ${result}
    `

  }
}

export const MDXPlugin = (options?: MDXPluginOptions) => {
  return new FuseBoxMDXPlugin(options)
}
