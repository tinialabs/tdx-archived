# `@tinia/tdx-loader`

Webpack loader for [TDX][].

## Installation

[npm][]:

```sh
npm i -D @tinia/tdx-loader
```

## Usage

```js
// ...
module: {
  rules: [
    // ...
    {
      test: /\.tdx$/,
      use: [
        'babel-loader',
        '@tinia/tdx-loader'
      ]
    }
  ]
}
```

## License

[MIT][] © [Tinia Labs][] 

<!-- Definitions -->

[mit]: license

[Tinia Labs]: https://tinia.org

[tdx]: https://github.com/tinialabs/tdx

[npm]: https://docs.npmjs.com/cli/install
