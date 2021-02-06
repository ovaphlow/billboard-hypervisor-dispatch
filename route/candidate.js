/**
 * 2021-01
 * candidate: 原普通用户(common-user)
 */
const dayjs = require('dayjs');
const Router = require('@koa/router');

const logger = require('../logger');
const mysql = require('../mysql');

const router = new Router({
  prefix: '/api/candidate',
});

module.exports = router;

router.put('/statistic', async (ctx) => {
  try {
    const option = ctx.request.query.option || '';
    if (option === 'all') {
      const sql = 'select count(*) as qty from common_user';
      const pool = mysql.promise();
      const [rows] = await pool.query(sql);
      ctx.response.body = rows[0].qty;
    } else if (option === 'today') {
      const sql = `
          select count(*) as qty
          from common_user
          where position(? in datime) > 0
          `;
      const pool = mysql.promise();
      const [rows] = await pool.query(sql, [dayjs().format('YYYY-MM-DD')]);
      ctx.response.body = rows[0].qty;
    }
  } catch (err) {
    logger.error(err);
    ctx.response.status = 500;
  }
});
