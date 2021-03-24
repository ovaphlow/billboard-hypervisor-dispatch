const dayjs = require('dayjs');
const Router = require('@koa/router');

const logger = require('./logger');
const mysql = require('./mysql');

const router = new Router({
  prefix: '/api/biz',
});

module.exports = router;

router.get('/candidate/statistic', async (ctx) => {
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
          where position(? in date_create) > 0
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

router.get('/employer/filter', async (ctx) => {
  try {
    const option = ctx.request.query.option || '';
    if (option === '') {
      const sql = `
          select id, uuid, name, faren, phone
          from enterprise
          where position(? in name) > 0
            or position(? in phone) > 0
          order by id desc
          limit 100
          `;
      const pool = mysql.promise();
      const [rows] = await pool.query(sql, [
        ctx.request.query.keyword || '',
        ctx.request.query.keyword || '',
      ]);
      ctx.response.body = rows;
    } else if (option === 'to-certificate') {
      const sql = `
          select id, uuid, name, faren
          from enterprise
          where status = '待认证'
            and yingyezhizhao_tu is not null
            and position(? in name) > 0
          order by id desc
          limit 100
          `;
      const pool = mysql.promise();
      const [rows] = await pool.query(sql, [ctx.request.query.name || '']);
      ctx.response.body = rows;
    }
  } catch (err) {
    logger.error(err);
    ctx.response.status = 500;
  }
});

router.get('/employer/statistic', async (ctx) => {
  try {
    const option = ctx.request.query.option || '';
    if (option === 'all') {
      const sql = 'select count(*) as qty from enterprise';
      const pool = mysql.promise();
      const [rows] = await pool.query(sql);
      ctx.response.body = rows[0].qty;
    } else if (option === 'today') {
      const sql = `
          select count(*) as qty
          from enterprise
          where position(? in date) > 0
          `;
      const pool = mysql.promise();
      const [rows] = await pool.query(sql, [dayjs().format('YYYY-MM-DD')]);
      ctx.response.body = rows[0].qty;
    } else if (option === 'to-certificate-qty') {
      const sql = `
          select count(*) as qty
          from enterprise
          where status = '待认证'
            and yingyezhizhao_tu is not null
          `;
      const pool = mysql.promise();
      const [rows] = await pool.query(sql);
      ctx.response.body = rows[0].qty || 0;
    }
  } catch (err) {
    logger.error(err);
    ctx.response.status = 500;
  }
});

router.put('/employer/:id', async (ctx) => {
  try {
    const option = ctx.request.query.option || '';
    if (option === 'certificate') {
      const sql = `
          update enterprise
          set status = '认证'
            , yingyezhizhao_tu = null
          where id = ?
            and uuid = ?
          `;
      const pool = mysql.promise();
      await pool.execute(sql, [parseInt(ctx.params.id), ctx.request.query.uuid]);
      ctx.response.status = 200;
    }
  } catch (err) {
    logger.error(err);
    ctx.response.status = 500;
  }
});

router.get('/job/statistic', async (ctx) => {
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

router.get('/send-in/statistic', async (ctx) => {
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
