'use strict';

var koa = require('koa');
var koaNunjucks = require('..');
var path = require('path');
var request = require('supertest');
var expect = require('chai').expect;

describe('koa-nunjucks', function() {
  describe('config', function() {
    it('should fill unspecified config options with defaults', function() {
      var config = {
        path: path.join(__dirname, 'views')
      };
      koaNunjucks(config);

      expect(config.writeResponse).to.be.true;
    });

    it('should add a period to extension when missing', function() {
      var config = {
        ext: 'strawbrary',
        path: path.join(__dirname, 'views')
      };
      koaNunjucks(config);

      expect(config.ext).to.equal('.strawbrary');
    });

    it('should not add a period when already specified', function() {
      var config = {
        ext: '.cake',
        path: path.join(__dirname, 'views')
      };
      koaNunjucks(config);

      expect(config.ext).to.equal('.cake');
    });

    it('should throw an error for unknown config options', function() {
      var config = {
        ext: '.cake',
        path: path.join(__dirname, 'views'),
        writeResp: true
      };

      expect(koaNunjucks.bind(null, config)).to.throw('Unknown config option: writeResp');
    });

    it('should not add an extension when config.ext is falsy', function(done) {
      var app = koa();

      app.context.render = koaNunjucks({
        ext: false,
        path: path.join(__dirname, 'views')
      });

      app.use(function*() {
        yield this.render('home.html');
      });

      request(app.listen())
        .get('/')
        .expect(/<body>Hello from Koa Nunjucks!<\/body>/)
        .expect(200, done);
    });

    it('should pass nunjucksConfig to Nunjucks', function(done) {
      var app = koa();

      app.context.render = koaNunjucks({
        path: path.join(__dirname, 'views'),
        nunjucksConfig: {
          autoescape: false
        }
      });

      app.use(function*() {
        yield this.render('context', {
          park: '<b>Sweet escape</b>'
        });
      });

      request(app.listen())
        .get('/')
        .expect(/<b>Sweet escape<\/b>/)
        .expect(200, done);
    });

  });

  describe('path', function () {
    var app = koa();

    app.context.render = koaNunjucks({
      path: [ path.join(__dirname, 'views'), path.join(__dirname, 'views/other') ],
      nunjucksConfig: {
        autoescape: false
      }
    });
    app.use(function*() {
      if (this.url == '/other') yield this.render('multipath');
      if (this.url == '/') yield this.render('path');
    });
    describe('path as array', function () {
      it('should pass for the first path of the paths array', function (done) {
        request(app.listen())
            .get('/other')
            .expect(/<h1>Hi i'm supporting multipath<\/h1>/)
            .expect(200, done);
      })
      it('should pass for the second path of the paths array', function (done) {
        request(app.listen())
            .get('/')
            .expect(/<h1>i'm multi path too<\/h1>/)
            .expect(200, done);
      })
    })
  })

  describe('render', function() {
    var app;

    beforeEach(function() {
      app = koa();
    });

    it('should pass context variables to template', function(done) {
      app.context.render = koaNunjucks({
        path: path.join(__dirname, 'views')
      });

      app.use(function*() {
        yield this.render('context', {
          park: 'Local'
        });
      });

      request(app.listen())
        .get('/')
        .expect('content-type', 'text/html; charset=utf-8')
        .expect(/<title>Title override<\/title>/)
        .expect(/<body>Local<\/body>/)
        .expect(200, done);
    });

    it('should pass global variables from ctx.state', function(done) {
      app.context.render = koaNunjucks({
        path: path.join(__dirname, 'views')
      });

      app.use(function*(next) {
        this.state.park = 'Global';

        yield next;
      });

      app.use(function*() {
        yield this.render('context');
      });

      request(app.listen())
        .get('/')
        .expect('content-type', 'text/html; charset=utf-8')
        .expect(/<body>Global<\/body>/)
        .expect(200, done);
    });

    it('should override ctx.state with local context', function(done) {
      app.context.render = koaNunjucks({
        path: path.join(__dirname, 'views')
      });

      app.use(function*(next) {
        this.state.park = 'Global';

        yield next;
      });

      app.use(function*() {
        yield this.render('context', {
          park: 'Local override'
        });
      });

      request(app.listen())
        .get('/')
        .expect('content-type', 'text/html; charset=utf-8')
        .expect(/<body>Local override<\/body>/)
        .expect(200, done);
    });

    it('should not write to response body when config.writeResponse is false', function(done) {
      app.context.render = koaNunjucks({
        writeResponse: false,
        path: path.join(__dirname, 'views')
      });

      app.use(function*() {
        yield this.render('home');
      });

      request(app.listen())
        .get('/')
        .expect('Not Found')
        .expect(404, done);
    });

    it('should call the callback if specified', function(done) {
      app.context.render = koaNunjucks({
        path: path.join(__dirname, 'views')
      });

      app.use(function*() {
        yield this.render('home', {}, function(err, res) {
          expect(err).to.be.null;
          expect(res).to.match(/<body>Hello from Koa Nunjucks!<\/body>/);
          done();
        });
      });

      request(app.listen())
        .get('/')
        .end(function() {});
    });
  });

  describe('filters', function() {
    var app = koa();

    app.context.render = koaNunjucks({
      ext: 'html',
      path: path.join(__dirname, 'views')
    });

    app.use(function*() {
      yield this.render('filter', {
        sentence: 'Hello from a filter!',
        length: 12
      });
    });

    var nunjucksEnv = app.context.render.env;
    nunjucksEnv.addFilter('shorten', function(str, count) {
      return str.slice(0, count || 5);
    });

    it('should allow filters to be defined', function(done) {
      request(app.listen())
        .get('/')
        .expect('content-type', 'text/html; charset=utf-8')
        .expect(/<body>Hello from a<\/body>/)
        .expect(200, done);
    });
  });
});