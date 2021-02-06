/**
 * 2021-01
 * job: 原岗位(recruitment)
 */
const dayjs = require('dayjs');
const Router = require('@koa/router');

const logger = require('../logger');
const mysql = require('../mysql');

const router = new Router({
  prefix: '/api/job',
});

module.exports = router;

router.put('/statistic', async (ctx) => {
  try {
    const option = ctx.request.query.option || '';
    if (option === 'all') {
      const sql = 'select count(*) as qty from recruitment';
      const pool = mysql.promise();
      const [rows] = await pool.query(sql);
      ctx.response.body = rows[0].qty;
    }
  } catch (err) {
    logger.error(err);
    ctx.response.status = 500;
  }
});
