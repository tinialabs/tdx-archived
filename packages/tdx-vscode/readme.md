# TDX for Visual Studio Code

Adds language support for [TDX](https://github.com/tinialabs/notebook).

## Installation

You can install this extension from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=tinialabs.tdx).

## What about `.mdx` and `.md` files?

By default the TDX language is applied only to `.tdx` files. If TDX files in your project end with `.mdx` or `.md`, you can tell VS Code that by adding the following to your workspace settings:

```json
"files.associations": {
  "*.md": "tdx",
  "*.mdx": "tdx"
},
```

## Auto-close tags

If you want VS Code to automatically close tags while you type, you can install [Auto Close Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-close-tag) and configure it to also include the language `tdx`:

```json
"auto-close-tag.activationOnLanguage": [
  "xml",
  "php",
  "...",
  "tdx"
]
```

### License

MIT
