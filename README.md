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
For Koa 2, use the next tag
```
npm install --save koa-nunjucks-2@next
```

## Usage
### Example
```js
var koa = require('koa');
var app = koa();
var koaNunjucks = require('koa-nunjucks-2');
var path = require('path');

app.context.render = koaNunjucks({
  ext: 'html',
  path: path.join(__dirname, 'views'),
  nunjucksConfig: {
    autoescape: true
  }
});

app.use(function*() {
  yield this.render('home', {double: 'rainbow'});
});
```

### Config Options
* **ext** *(default: 'html')*: Extension that will be automatically appended to the file name in `this.render` calls. Set to a falsy value to disable.
* **path** *(default: current directory)*: Path to the templates. Also supports passing an array of paths.
* **recursiveMergeVariables** *(default: true)*: Whether to recursively merge and deep copy global template variables with locals
* **writeResponse** *(default: true)*: If true, writes the rendered output to `response.body`.
* **nunjucksConfig**: Object of [Nunjucks config options](https://mozilla.github.io/nunjucks/api.html#configure).

### Global Template Variables
Use [ctx.state](https://github.com/koajs/koa/blob/master/docs/api/context.md#ctxstate) to make a variable available in all templates.

### Extending Nunjucks
The configuration function returns a [Nunjucks Environment](https://mozilla.github.io/nunjucks/api.html#environment) which allows you to define custom filters, extensions etc.

```js
app.context.render = koaNunjucks({
  ext: 'html',
  path: path.join(__dirname, 'views')
});

var nunjucksEnv = app.context.render.env;
nunjucksEnv.addFilter('shorten', function(str, count) {
  return str.slice(0, count || 5);
});
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
