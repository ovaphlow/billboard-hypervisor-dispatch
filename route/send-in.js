/**
 * 2021-01
 * send-in: 原投递简历(delivery)
 */
const dayjs = require('dayjs');
const Router = require('@koa/router');

const logger = require('../logger');
const mysql = require('../mysql');

const router = new Router({
  prefix: '/api/send-in',
});

module.exports = router;

router.put('/statistic', async (ctx) => {
  try {
    const option = ctx.request.query.option || '';
    if (option === 'all') {
      const sql = 'select count(*) as qty from delivery';
      const pool = mysql.promise();
      const [rows] = await pool.query(sql);
      ctx.response.body = rows[0].qty;
    }
  } catch (err) {
    logger.error(err);
    ctx.response.status = 500;
  }
});
