/*!
 * koa-nunjucks-2
 * Copyright (c) 2016 strawbrary
 * MIT Licensed
 */
const bluebird = require('bluebird');
const defaults = require('lodash.defaults');
const difference = require('lodash.difference');
const merge = require('lodash.merge');
const path = require('path');
const nunjucks = require('nunjucks');

/**
 * @type {Object}
 */
const defaultSettings = {
  ext: 'njk',                 // Extension that will be automatically appended to the file name in this.render calls. Set to a falsy value to disable.
  path: '',                   // Path to the templates.
  writeResponse: true,        // If true, writes the rendered output to response.body.
  functionName: 'render',     // The name of the function that will be called to render the template
  nunjucksConfig: {},         // Object of Nunjucks config options.
  configureEnvironment: null, // Function to further modify the Nunjucks environment
};

/**
 * @param {Object=} config
 */
exports = module.exports = (config = {}) => {
  defaults(config, defaultSettings);

  // Sanity check for unknown config options
  const configKeysArr = Object.keys(config);
  const knownConfigKeysArr = Object.keys(defaultSettings);
  if (configKeysArr.length > knownConfigKeysArr.length) {
    const unknownConfigKeys = difference(configKeysArr, knownConfigKeysArr);
    throw new Error(`Unknown config option: ${unknownConfigKeys.join(', ')}`);
  }

  config.path = path.resolve(process.cwd(), config.path);

  if (config.ext) {
    config.ext = `.${config.ext.replace(/^\./, '')}`;
  } else {
    config.ext = '';
  }

  const env = nunjucks.configure(config.path, config.nunjucksConfig);
  env.renderAsync = bluebird.promisify(env.render);

  if (typeof config.configureEnvironment === 'function') {
    config.configureEnvironment(env);
  }

  return async (ctx, next) => {
    if (ctx[config.functionName]) {
      throw new Error(`ctx.${config.functionName} is already defined`);
    }

    /**
     * @param {string} view
     * @param {Object=} context
     * @returns {string}
     */
    ctx[config.functionName] = async (view, context) => {
      const mergedContext = merge({}, ctx.state, context);

      view += config.ext;

      return env.renderAsync(view, mergedContext)
        .then(html => {
          if (config.writeResponse) {
            ctx.type = 'html';
            ctx.body = html;
          }
        });
    };

    await next();
  };
};
