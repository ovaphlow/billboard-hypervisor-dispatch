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
  await next();
  const rt = ctx.response.get('X-Response-Time');
  logger.log(`${new Date()} [${ctx.method}] ${ctx.url} - ${rt}`);
});

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
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
  const router = require('./route/job');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  const router = require('./route/send-in');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  const router = require('./route/employer');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  const router = require('./route/candidate');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  const routerContent = require('./route/content');
  app.use(routerContent.routes());
  app.use(routerContent.allowedMethods());
})();

(() => {
  const routerMisUser = require('./route/mis-user');
  app.use(routerMisUser.routes());
  app.use(routerMisUser.allowedMethods());
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
  const routerRecruitment = require('./route/recruitment');
  app.use(routerRecruitment.routes());
  app.use(routerRecruitment.allowedMethods());
})();

(() => {
  const routerCommonUser = require('./route/common-user');
  app.use(routerCommonUser.routes());
  app.use(routerCommonUser.allowedMethods());
})();

(() => {
  const routerResume = require('./route/resume');
  app.use(routerResume.routes());
  app.use(routerResume.allowedMethods());
})();

(() => {
  const routerDelivery = require('./route/delivery');
  app.use(routerDelivery.routes());
  app.use(routerDelivery.allowedMethods());
})();

(() => {
  const routerFavorite = require('./route/favorite');
  app.use(routerFavorite.routes());
  app.use(routerFavorite.allowedMethods());
})();

(() => {
  const routerJournal = require('./route/journal');
  app.use(routerJournal.routes());
  app.use(routerJournal.allowedMethods());
})();

(() => {
  const routerFeedback = require('./route/feedback');
  app.use(routerFeedback.routes());
  app.use(routerFeedback.allowedMethods());
})();

(() => {
  const routerReport = require('./route/report');
  app.use(routerReport.routes());
  app.use(routerReport.allowedMethods());
})();

(() => {
  const routerSetting = require('./route/setting');
  app.use(routerSetting.routes());
  app.use(routerSetting.allowedMethods());
})();

(() => {
  const routerCurrentUser = require('./route/current-user');
  app.use(routerCurrentUser.routes());
  app.use(routerCurrentUser.allowedMethods());
})();

(() => {
  const routerStats = require('./route/stats');
  app.use(routerStats.routes());
  app.use(routerStats.allowedMethods());
})();

(() => {
  const routerBulletin = require('./route/bulletin');
  app.use(routerBulletin.routes());
  app.use(routerBulletin.allowedMethods());
})();

(() => {
  const routerJobFair = require('./route/job-fair');
  app.use(routerJobFair.routes());
  app.use(routerJobFair.allowedMethods());
})();

module.exports = app;