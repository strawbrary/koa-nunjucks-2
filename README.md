# koa-nunjucks-2
Thin wrapper over [Nunjucks](http://mozilla.github.io/nunjucks/) 2.0 for [Koa](http://koajs.com/).

## Usage
### Example
```js
var koa = require('koa');
var app = koa();
var koaNunjucks = require('koa-nunjucks-2');
var path = require('path');

app.context.render = koaNunjucks({
  autoescape: true,
  ext: 'html',
  path: path.join(__dirname, 'views')
});

app.use(function*() {
  yield this.render('home', {double: 'rainbow'});
});
```

### Config Options
* **autoescape** (boolean): Whether variables are automatically escaped in templates
* **dev** (boolean): Determines if full stack traces from the origin of the error are shown
* **ext** (string): Specifying an extension allows you to omit extensions in this.render calls
* **lstripBlocks** (boolean): Whether to strip leading whitespace from blocks
* **noCache** (boolean): Whether to disable template caching
* **path** (string): Path to the templates
* **throwOnUndefined** (boolean): Throw an error if a template variable is undefined
* **trimBlocks** (boolean): Whether to trim first newline at end of blocks
* **watch** (boolean): Reload templates when they are changed
* **writeResp** (boolean): Whether to write the rendered output to response.body

### Global Template Variables
Use [ctx.state](https://github.com/koajs/koa/blob/master/docs/api/context.md#ctxstate) to make a variable available in all templates.

### Extending Nunjucks
The configuration function returns a [Nunjucks Environment](http://mozilla.github.io/nunjucks/api.html#environment) which allows you to define custom filters, extensions etc.

```js
app.context.render = koaNunjucks({
  autoescape: true,
  ext: 'html',
  path: path.join(__dirname, 'views')
});

var nunjucksEnv = app.context.render.env;
nunjucksEnv.addFilter('shorten', function(str, count) {
    return str.slice(0, count || 5);
});
```

## License
The MIT License (MIT)

Copyright (c) 2015 strawbrary

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.