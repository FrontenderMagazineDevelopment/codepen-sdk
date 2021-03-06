module.exports = {
  "presets": [
    ["@babel/preset-env", {
        "targets": {
          "node": "current",
          "browsers": ["> 3%", "ie 11"]
        },
        modules: 'umd',
        debug: false,
    }],
  ],
  "plugins": [
    "@babel/plugin-proposal-class-properties",
      "@babel/proposal-export-default",
    ["@babel/plugin-proposal-decorators", {
      "legacy": true
    }],
    "@babel/plugin-proposal-optional-chaining",
    "@babel/plugin-proposal-export-default-from"
  ],
};