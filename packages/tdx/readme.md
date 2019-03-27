# @tinialabs/tdx

Tinia Data eXchange (TDX) implementation for Tinia Notebooks using Remark. Forked from @mdx-js/mdx with updated transpiler for Tinia runtime

While the `tdx` specification is very similar to `mdx`, a different extension is used as the code in any code blocks is now executed. In addition the execution order of an `mdx` is linear (a single document) where as a `tdx` document is executed as a parallel series of interdependent chunks where the order of writing does not matter. The specification also includes yaml front matter by default.

https://github.com/tinialabs/notebook

## Installation

```sh
npm i -S @tinialabs/tdx
```
