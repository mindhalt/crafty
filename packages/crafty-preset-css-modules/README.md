## Installation

```bash
npm install @swissquote/crafty-preset-css-modules --save
```

```javascript
module.exports = {
  presets: [
    "@swissquote/crafty-runner-webpack",
    "@swissquote/crafty-preset-postcss",
    "@swissquote/crafty-preset-css-modules"
  ],
  js: {
    app: {
      runner: "webpack",
      source: "js/app.js",
      hot: true, // Hot Module Replacement must be enabled for React Hot Loader to work
      react: true // React Hot Loader must be explicitly enabled in your bundle
      extractCSS: "../css/[name].min.scss" // Can be set to "true"
    }
  }
};
```
