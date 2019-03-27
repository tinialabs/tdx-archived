import React from 'react'

import { useTDXContext } from './tdx-provider'

const defaults = {
  inlineCode: 'code',
  wrapper: 'div'
}

interface TDXTagProps {
  name: string
  parentName?: string
  Layout?: string
  layoutProps?: any
  children?: any
  props?: any
}

export const TDXTag = (props: TDXTagProps) => {
  const components = useTDXContext()
  
  const {
    name,
    parentName,
    children,
    Layout,
    layoutProps,
    props: childProps
  } = props

  if (false && name == 'html') {
    return <span dangerouslySetInnerHTML={{ __html: children as string }} />
  }

  const Component =
    components[`${parentName}.${name}`] ||
    components[name] ||
    defaults[name] ||
    name

  if (Layout) {
    return (
      <Layout components={components} {...layoutProps}>
        <Component {...childProps}>{children}</Component>
      </Layout>
    )
  }

  return <Component {...childProps}>{children}</Component>
}
