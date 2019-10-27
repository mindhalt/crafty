const path = require("path");

const MODULES = path.join(__dirname, "node_modules");

module.exports = {
  // defaultConfig() {
  //   return {
  //     css_modules: {
  //       mode: 'local',
  //       localIdentName: '[local]'
  //     }
  //   };
  // },
  config(config) {
    if (config.js) {
      for (let j in config.js) {
        config.js[j].css_modules = {
          mode: 'local',
          localIdentName: '[local]'
        };
      }
    }
  },
  webpack(crafty, bundle, chain) {
    chain.module.rule("styles")
      .use("css-loader")
      .options({
        modules: crafty.config.css_modules
      });
  }
};
