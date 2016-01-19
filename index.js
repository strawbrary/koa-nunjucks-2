/*!
 * koa-nunjucks-2
 * Copyright (c) 2016 strawbrary
 * MIT Licensed
 */
'use strict';

var bluebird = require('bluebird');
var defaults = require('lodash.defaults');
var difference = require('lodash.difference');
var merge = require('lodash.merge');
var path = require('path');
var nunjucks = require('nunjucks');

/**
 * @type {Object}
 */
const defaultSettings = {
  ext: 'html',               // Extension that will be automatically appended to the file name in this.render calls. Set to a falsy value to disable.
  path: '',                  // Path to the templates.
  writeResponse: true,       // If true, writes the rendered output to response.body.
  functionName: 'render',    // The name of the function that will be called to render the template
  nunjucksConfig: {},        // Object of Nunjucks config options.
  configureEnvironment: null // Function to further modify the Nunjucks environment
};

/**
 * @param {Object=} opt_config
 */
exports = module.exports = function(opt_config) {
  var config = {};
  if (config) {
    config = opt_config;
  }

  defaults(config, defaultSettings);

  // Sanity check for unknown config options
  var configKeysArr = Object.keys(config);
  var knownConfigKeysArr = Object.keys(defaultSettings);
  if (configKeysArr.length > knownConfigKeysArr.length) {
    var unknownConfigKeys = difference(configKeysArr, knownConfigKeysArr);
    throw new Error('Unknown config option: ' + unknownConfigKeys.join(', '));
  }

  config.path = path.resolve(process.cwd(), config.path);

  if (config.ext) {
    config.ext = '.' + config.ext.replace(/^\./, '');
  } else {
    config.ext = '';
  }

  var env = nunjucks.configure(config.path, config.nunjucksConfig);
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
     * @param {Object=} opt_context
     * @returns {string}
     */
    ctx[config.functionName] = async (view, opt_context) => {
      var context = merge({}, ctx.state, opt_context);

      view += config.ext;

      return env.renderAsync(view, context)
        .then(html => {
          if (config.writeResponse) {
            ctx.type = 'html';
            ctx.body = html;
          }
        });
    };

    await next();
  }
};