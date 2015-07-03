/*!
 * koa-nunjucks-2
 * Copyright (c) 2015 strawbrary
 * MIT Licensed
 */
'use strict';

var _ = require('lodash');
var copy = require('copy-to');
var path = require('path');
var nunjucks = require('nunjucks');

/**
 * @type {Object}
 */
const defaultSettings = {
  autoescape: true,        // Whether variables are automatically escaped in templates
  dev: false,              // Determines if full stack traces from the origin of the error are shown*
  ext: 'html',             // Specifying an extension allows you to omit extensions in this.render calls
  lstripBlocks: false,     // Whether to strip leading whitespace from blocks
  noCache: false,          // Whether to disable template caching
  path: '',                // Path to the templates
  throwOnUndefined: false, // Throw an error if a template variable is undefined
  trimBlocks: false,       // Whether to trim first newline at end of blocks
  watch: true,             // Reload templates when they are changed
  writeResp: true          // Whether to write the rendered output to response.body
};

/**
 * Config options which belong to this package, not Nunjucks itself
 * @type {Array.<string>}
 * @const
 */
const packageConfigOptions = [
  'ext',
  'path',
  'writeResp'
];

/**
 * @param {Object=} opt_config
 */
exports = module.exports = function(opt_config) {
  var config = {};
  if (config) {
    config = opt_config;
  }

  copy(defaultSettings).to(config);

  config.path = path.resolve(process.cwd(), config.path);
  config.ext = '.' + config.ext.replace(/^\./, '');

  // Strip the package specific config options before passing to Nunjucks
  var nunjucksConfig = _.omit(config, packageConfigOptions);

  var env = nunjucks.configure(config.path, nunjucksConfig);

  /**
   * Main function to be placed on app.context
   * @param {string} view
   * @param {Object=} opt_context
   * @param {Function=} opt_callback
   * @returns {string}
   */
  var render = function*(view, opt_context, opt_callback) {
    var context = _.merge({}, this.state, opt_context);

    view += config.ext;

    var html = env.render(view, context, opt_callback);

    if (config.writeResp) {
      this.type = 'html';
      this.body = html;
    }

    return html;
  };

  // Expose the Nunjucks Environment
  render.env = env;

  return render;
};