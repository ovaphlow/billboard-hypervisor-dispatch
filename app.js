const path = require('path');

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const staticCache = require('koa-static-cache');

const logger = require('./logger');

const app = new Koa();

app.env = 'production';

app.use(
  bodyParser({
    jsonLimit: '8mb',
  }),
);

// eslint-disable-next-line
const STATIC_PATH = path.join(__dirname, '../billboard-hypervisor-ui/dist');
app.use(
  staticCache(STATIC_PATH, {
    maxAge: 60 * 60 * 24 * 7,
    gzip: true,
  }),
);

app.use(async (ctx, next) => {
  logger.info(`${new Date()} --> ${ctx.request.method} ${ctx.request.url}`);
  await next();
  logger.info(`${new Date()} <-- ${ctx.request.method} ${ctx.request.url}`);
});

app.on('error', (err, ctx) => {
  logger.error('server error', err, ctx);
});

app.use(async (ctx, next) => {
  if (ctx.request.url === '/' && ctx.request.method === 'GET') {
    ctx.redirect('/index.html');
  } else {
    await next();
  }
});

(() => {
  const router = require('./route-biz');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  const router = require('./route-bulletin');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  const router = require('./route-miscellaneous');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  const routerEnterprise = require('./route/enterprise');
  app.use(routerEnterprise.routes());
  app.use(routerEnterprise.allowedMethods());
})();

(() => {
  const routerEnterpriseUser = require('./route/enterprise-user');
  app.use(routerEnterpriseUser.routes());
  app.use(routerEnterpriseUser.allowedMethods());
})();

(() => {
  const routerJournal = require('./route/journal');
  app.use(routerJournal.routes());
  app.use(routerJournal.allowedMethods());
})();

module.exports = app;
