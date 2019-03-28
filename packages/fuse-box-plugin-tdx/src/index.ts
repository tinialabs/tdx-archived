import { WorkFlowContext, File, Plugin } from 'fuse-box'
const tdx = require('@tinia/tdx')

export interface TDXPluginOptions {
  mdPlugins?: any[]
  hastPlugins?: any[]
}

export class FuseBoxTDXPlugin implements Plugin {
  public test: RegExp = /\.(md|mdx)$/

  public options: TDXPluginOptions = {
    mdPlugins: [],
    hastPlugins: []
  }

  constructor(opts: TDXPluginOptions = {}) {
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

export const TDXPlugin = (options?: TDXPluginOptions) => {
  return new FuseBoxTDXPlugin(options)
}
