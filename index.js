/*!
 * koa-nunjucks-2
 * Copyright (c) 2015 strawbrary
 * MIT Licensed
 */
'use strict';

var defaults = require('lodash.defaults');
var difference = require('lodash.difference');
var merge = require('lodash.merge');
var path = require('path');
var nunjucks = require('nunjucks');

/**
 * @type {Object}
 */
const defaultSettings = {
  ext: 'html',                   // Extension that will be automatically appended to the file name in this.render calls. Set to a falsy value to disable.
  path: '',                      // Path to the templates.
  recursiveMergeVariables: true, // Whether to recursively merge and deep copy global template variables with locals
  writeResponse: true,           // If true, writes the rendered output to response.body.
  nunjucksConfig: {}             // Object of Nunjucks config options.
};

/**
 * @param {Object=} opt_config
 */
exports = module.exports = function(opt_config) {
  var config = {};
  if (opt_config) {
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

  if (Array.isArray(config.path)) {
    config.path = config.path.map(item => path.resolve(process.cwd(), item));
  }
  else config.path = path.resolve(process.cwd(), config.path);

  if (config.ext) {
    config.ext = '.' + config.ext.replace(/^\./, '');
  } else {
    config.ext = '';
  }

  var env = nunjucks.configure(config.path, config.nunjucksConfig);

  /**
   * Main function to be placed on app.context
   * @param {string} view
   * @param {Object=} opt_context
   * @param {Function=} opt_callback
   * @returns {string}
   */
  var render = function*(view, opt_context, opt_callback) {
    var context;
    if (config.recursiveMergeVariables) {
      context = merge({}, this.state, opt_context);
    } else {
      context = Object.assign({}, this.state, opt_context);
    }

    view += config.ext;

    var html = env.render(view, context, opt_callback);

    if (config.writeResponse) {
      this.type = 'html';
      this.body = html;
    }

    return html;
  };

  // Expose the Nunjucks Environment
  render.env = env;

  return render;
};
