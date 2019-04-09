import { default as tdxDefault, tdxSync as tdxSyncDefault } from './tdx'

export default function tdx(src: string, options: any = { singleBlock: false }) {
  return tdxDefault(
    src,
    Object.assign(
      {
        mdPlugins: [
          require('remark-emoji'),
          require('remark-images'),
          require('remark-autolink-headings'),
          require('remark-slug'),
          require('remark-unwrap-images')
        ],
        hastPlugins: []
      },
      options
    )
  )
}

export function tdxSync(src, options: any = { singleBlock: false }) {
  return tdxSyncDefault(
    src,
    Object.assign(
      {
        mdPlugins: [
          require('remark-emoji'),
          require('remark-images'),
          require('remark-autolink-headings'),
          require('remark-slug'),
          require('remark-unwrap-images')
        ],
        hastPlugins: []
      },
      options
    )
  )
}
