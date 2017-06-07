# koa-nunjucks-2
Lightweight [Koa](http://koajs.com/) middleware for [Nunjucks](https://mozilla.github.io/nunjucks/).

[![NPM version][npm-img]][npm-url]
[![Build status][travis-img]][travis-url]
[![License][license-img]][license-url]
[![Dependency status][david-img]][david-url]

## Installation
```
npm install --save koa-nunjucks-2
```
NOTE: v3 requires Koa 2 or later. If you're using Koa 1, use v2 of this package.

## Usage
### Example
```js
const Koa = require('koa');
const app = new Koa();
const koaNunjucks = require('koa-nunjucks-2');
const path = require('path');

app.use(koaNunjucks({
  ext: 'html',
  path: path.join(__dirname, 'views'),
  nunjucksConfig: {
    trimBlocks: true
  }
}));

app.use(async (ctx) => {
  await ctx.render('home', {double: 'rainbow'});
});
```

### Config Options
* **ext** *(default: 'njk')*: Extension that will be automatically appended to the file name in `ctx.render` calls. Set to a falsy value to disable.
* **path** *(default: current directory)*: Path to the templates. Also supports passing an array of paths.
* **writeResponse** *(default: true)*: If true, writes the rendered output to `response.body`.
* **functionName** *(default: 'render')*: The name of the function that will be called to render the template.
* **nunjucksConfig**: Object of [Nunjucks config options](https://mozilla.github.io/nunjucks/api.html#configure).
* **configureEnvironment**: A function to modify the Nunjucks environment. See the [Extending Nunjucks](#Extending Nunjucks) section below for usage.

### Global Template Variables
Use [ctx.state](https://github.com/koajs/koa/blob/master/docs/api/context.md#ctxstate) to make a variable available in all templates.

### Extending Nunjucks
Use the `configureEnvironment` config option to define a function which will receive a [Nunjucks Environment](https://mozilla.github.io/nunjucks/api.html#environment) as its argument. This allows you to define custom filters, extensions etc.

```js
app.use(koaNunjucks({
  ext: 'html',
  path: path.join(__dirname, 'views'),
  configureEnvironment: (env) => {
    env.addFilter('shorten', (str, count) => {
      return str.slice(0, count || 5);
    });
  }
}));

```

## License
  [MIT][license-url]


[npm-img]: https://img.shields.io/npm/v/koa-nunjucks-2.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-nunjucks-2
[travis-img]: https://img.shields.io/travis/strawbrary/koa-nunjucks-2/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/strawbrary/koa-nunjucks-2
[license-img]: https://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE
[david-img]: https://img.shields.io/david/strawbrary/koa-nunjucks-2.svg?style=flat-square
[david-url]: https://david-dm.org/strawbrary/koa-nunjucks-2
