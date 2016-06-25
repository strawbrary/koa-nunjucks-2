/* eslint-disable func-names, prefer-arrow-callback */

const chai = require('chai');
chai.use(require('dirty-chai'));
const Koa = require('koa');
const koaNunjucks = require('../compiled');
const path = require('path');
const request = require('supertest');
const expect = chai.expect;

describe('koa-nunjucks on koa v2', function () {
  describe('config', function () {
    it('should fill unspecified config options with defaults', function () {
      const config = {
        path: path.join(__dirname, 'views'),
      };
      koaNunjucks(config);

      expect(config.writeResponse).to.be.true();
    });

    it('should add a period to extension when missing', function () {
      const config = {
        ext: 'html',
        path: path.join(__dirname, 'views'),
      };
      koaNunjucks(config);

      expect(config.ext).to.equal('.html');
    });

    it('should not add a period when already specified', function () {
      const config = {
        ext: '.cake',
        path: path.join(__dirname, 'views'),
      };
      koaNunjucks(config);

      expect(config.ext).to.equal('.cake');
    });

    it('should throw an error for unknown config options', function () {
      const config = {
        ext: '.cake',
        path: path.join(__dirname, 'views'),
        writeResp: true,
      };

      expect(koaNunjucks.bind(null, config)).to.throw('Unknown config option: writeResp');
    });

    it('should allow render method to have a custom name', function (done) {
      const app = new Koa();

      app.use(koaNunjucks({
        functionName: 'renderNunjucks',
        path: path.join(__dirname, 'views'),
      }));

      app.use(async (ctx) => {
        await ctx.renderNunjucks('home');
      });

      request(app.listen())
        .get('/')
        .expect(200, done);
    });

    it('should not add an extension when config.ext is falsy', function (done) {
      const app = new Koa();

      app.use(koaNunjucks({
        ext: false,
        path: path.join(__dirname, 'views'),
      }));

      app.use(async (ctx) => {
        await ctx.render('home.njk');
      });

      request(app.listen())
        .get('/')
        .expect(/<body>Hello from Koa Nunjucks!<\/body>/)
        .expect(200, done);
    });

    it('should pass nunjucksConfig to Nunjucks', function (done) {
      const app = new Koa();

      app.use(koaNunjucks({
        path: path.join(__dirname, 'views'),
        nunjucksConfig: {
          autoescape: false,
        },
      }));

      app.use(async (ctx) => {
        await ctx.render('context', {
          park: '<b>Sweet escape</b>',
        });
      });

      request(app.listen())
        .get('/')
        .expect(/<b>Sweet escape<\/b>/)
        .expect(200, done);
    });
  });

  describe('path', function () {
    const app = new Koa();

    app.use(koaNunjucks({
      path: [path.join(__dirname, 'views'), path.join(__dirname, 'views/other')],
      nunjucksConfig: {
        autoescape: false,
      },
    }));

    app.use(async (ctx) => {
      if (ctx.url === '/other') await ctx.render('multipath');
      if (ctx.url === '/') await ctx.render('path');
    });

    describe('path as array', function () {
      it('should pass for the first path of the paths array', function (done) {
        request(app.listen())
          .get('/other')
          .expect(/<h1>Hi i'm supporting multipath<\/h1>/)
          .expect(200, done);
      });

      it('should pass for the second path of the paths array', function (done) {
        request(app.listen())
          .get('/')
          .expect(/<h1>i'm multi path too<\/h1>/)
          .expect(200, done);
      });
    });
  });

  describe('middleware', function () {
    let app;

    beforeEach(function () {
      app = new Koa();
    });

    it('should throw an error when default render method is already defined', function (done) {
      app.use(async (ctx, next) => {
        try {
          await next();
        } catch (err) {
          expect(err.toString()).to.equal('Error: ctx.render is already defined');
          done();
        }
      });

      app.use(async (ctx, next) => {
        ctx.render = async () => {};

        await next();
      });

      app.use(koaNunjucks({
        ext: false,
        path: path.join(__dirname, 'views'),
      }));

      request(app.listen())
        .get('/')
        .end(() => {});
    });

    it('should throw an error when custom render method is already defined', function (done) {
      app.use(async (ctx, next) => {
        try {
          await next();
        } catch (err) {
          expect(err.toString()).to.equal('Error: ctx.renderNunjucks2 is already defined');
          done();
        }
      });

      app.use(async (ctx, next) => {
        ctx.renderNunjucks2 = async () => {};

        await next();
      });

      app.use(koaNunjucks({
        ext: false,
        functionName: 'renderNunjucks2',
        path: path.join(__dirname, 'views'),
      }));

      request(app.listen())
        .get('/')
        .end(() => {});
    });
  });

  describe('render', function () {
    let app;

    beforeEach(function () {
      app = new Koa();
    });

    it('should pass context variables to template', function (done) {
      app.use(koaNunjucks({
        path: path.join(__dirname, 'views'),
      }));

      app.use(async (ctx) => {
        await ctx.render('context', {
          park: 'Local',
        });
      });

      request(app.listen())
        .get('/')
        .expect('content-type', 'text/html; charset=utf-8')
        .expect(/<title>Title override<\/title>/)
        .expect(/<body>Local<\/body>/)
        .expect(200, done);
    });

    it('should pass global variables from ctx.state', function (done) {
      app.use(koaNunjucks({
        path: path.join(__dirname, 'views'),
      }));

      app.use(async (ctx, next) => {
        ctx.state.park = 'Global';

        await next();
      });

      app.use(async (ctx) => {
        await ctx.render('context');
      });

      request(app.listen())
        .get('/')
        .expect('content-type', 'text/html; charset=utf-8')
        .expect(/<body>Global<\/body>/)
        .expect(200, done);
    });

    it('should override ctx.state with local context', function (done) {
      app.use(koaNunjucks({
        path: path.join(__dirname, 'views'),
      }));

      app.use(async (ctx, next) => {
        ctx.state.park = 'Global';

        await next();
      });

      app.use(async (ctx) => {
        await ctx.render('context', {
          park: 'Local override',
        });
      });

      request(app.listen())
        .get('/')
        .expect('content-type', 'text/html; charset=utf-8')
        .expect(/<body>Local override<\/body>/)
        .expect(200, done);
    });

    it('should not write to response body when config.writeResponse is false', function (done) {
      app.use(koaNunjucks({
        writeResponse: false,
        path: path.join(__dirname, 'views'),
      }));

      app.use(async (ctx) => {
        await ctx.render('home');
      });

      request(app.listen())
        .get('/')
        .expect('Not Found')
        .expect(404, done);
    });
  });

  describe('filters', function () {
    const app = new Koa();

    app.use(koaNunjucks({
      path: path.join(__dirname, 'views'),
      configureEnvironment: (env) => {
        env.addFilter('shorten', function (str, count) {
          return str.slice(0, count || 5);
        });
      },
    }));

    app.use(async (ctx) => {
      await ctx.render('filter', {
        sentence: 'Hello from a filter!',
        length: 12,
      });
    });

    it('should allow filters to be defined', function (done) {
      request(app.listen())
        .get('/')
        .expect('content-type', 'text/html; charset=utf-8')
        .expect(/<body>Hello from a<\/body>/)
        .expect(200, done);
    });
  });
});
