import unified from 'unified'

// Third Party Remark Plugins
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import remarkSqueeze from 'remark-squeeze-paragraphs'

// Custom Tdx Remark Plugins
import tdxAstImportExport from './tdx-ast-import-export'
import tdxAstHtml from './tdx-ast-html'
import tdxAstTemplateVariables from './tdx-ast-template-variables'

// Convert AST to HAST (Remark -> Rehype)
import tdxAstToTdxHast from './tdx-ast-to-tdx-hast'

// Custom Tdx HAST Compilers
import tdxHastToInterim from './tdx-hast-to-interim'
import tdxInterimToJsx from './tdx-interim-to-jsx'
import tdxInterimToTinia from './tdx-interim-to-tinia'
import tdxTiniaToSingleMd from './tdx-tinia-single-md'

const BLOCKS_REGEX = '[a-z\\.]+(\\.){0,1}[a-z\\.]*'

const DEFAULT_OPTIONS = {
  singleBlock: false,
  footnotes: true,
  outputformat: 'jsx',
  mdPlugins: [],
  hastPlugins: [],
  compilers: [],
  blocks: [BLOCKS_REGEX]
}

function createTdxAstCompiler(options) {
  const mdPlugins = options.mdPlugins

  const fn = unified()
    .use(remarkParse, options)
    .use(tdxAstTemplateVariables)
    .use(tdxAstImportExport)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkSqueeze, options)

  mdPlugins.forEach(plugin => {
    // handle [plugin, pluginOptions] syntax
    if (Array.isArray(plugin) && plugin.length > 1) {
      fn.use(plugin[0], plugin[1])
    } else {
      fn.use(plugin, options)
    }
  })

  fn.use(tdxAstHtml, options).use(tdxAstToTdxHast, options)

  return fn
}

function applyHastPluginsAndCompilers(compiler, options) {
  const hastPlugins = options.hastPlugins
  const compilers = options.compilers

  hastPlugins.forEach(plugin => {
    // handle [plugin, pluginOptions] syntax
    if (Array.isArray(plugin) && plugin.length > 1) {
      compiler.use(plugin[0], plugin[1])
    } else {
      compiler.use(plugin, options)
    }
  })

  switch (options.outputformat) {
    case 'tinia':
      compiler.use(tdxHastToInterim, options)
      compiler.use(tdxInterimToTinia, options)
      compiler.use(tdxTiniaToSingleMd, options)
      break;
    case 'jsx':
    default:
      compiler.use(tdxHastToInterim, options)
      compiler.use(tdxInterimToJsx, options)
      break;
  }

  for (const compilerPlugin of compilers) {
    compiler.use(compilerPlugin, options)
  }

  return compiler
}

function createCompiler(options) {
  const compiler = createTdxAstCompiler(options)
  const compilerWithPlugins = applyHastPluginsAndCompilers(compiler, options)
  return compilerWithPlugins
}

export function tdxSync(
  src,
  options: any = {}
): any | undefined {
  const opts = Object.assign({}, DEFAULT_OPTIONS, options)
  const compiler = createCompiler(opts)

  const fileOpts: any = { contents: src }
  if (opts.filepath) {
    fileOpts.path = opts.filepath
  }

  try {
    const { contents } = compiler.processSync(fileOpts)
    return contents
  } catch (ex) {
    console.log(ex)
    return undefined
  }
}

export default async function tdxAsync(
  src,
  options: any = {}
): Promise<any | undefined> {
  const opts: any = Object.assign({}, DEFAULT_OPTIONS, options)
  const compiler = createCompiler(opts)

  const fileOpts: any = { contents: src }
  if (opts.filepath) {
    fileOpts.path = opts.filepath
  }

  try {
    const { contents } = await compiler.process(fileOpts)
    return contents
  } catch (ex) {
    console.log(ex)
    return undefined
  }

}