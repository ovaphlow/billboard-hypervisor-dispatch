const dayjs = require('dayjs');
const Router = require('@koa/router');

const logger = require('./logger');
const mysql = require('./mysql');

const router = new Router({
  prefix: '/api/biz',
});

module.exports = router;

router.get('/candidate/filter', async (ctx) => {
  try {
    const option = ctx.request.query.option || '';
    if (option === '') {
      const sql = `
      select id
        , uuid
        , name
        , phone
        , email
        -- , (select count(*) from favorite where user_id = cu.id) as qty_favorite
        -- 投递数量
        -- (select count(*) from favorite where common_user_id = cu.id) as qty_delivery
      from common_user as cu
      where position(? in name) > 0
        or position(? in phone) > 0
      order by id desc
      limit 100
      `;
      const pool = mysql.promise();
      const [rows] = await pool.query(sql, [ctx.request.query.keyword, ctx.request.query.keyword]);
      ctx.response.body = rows;
    } else if (option === 'by-id-list') {
      const sql = `
          select id, uuid, name, phone, email
          from common_user
          where id in (${ctx.request.query.list})
          `;
      const pool = mysql.promise();
      const [result] = await pool.query(sql);
      ctx.response.body = result;
    }
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

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

router.get('/candidate/:id', async (ctx) => {
  try {
    const sql = `
      select id, uuid, name, email, phone
      from common_user
      where id = ? and uuid = ?
      limit 1
      `;
    const pool = mysql.promise();
    const [rows] = await pool.query(sql, [parseInt(ctx.params.id), ctx.request.query.uuid]);
    ctx.response.body = rows.length === 1 ? rows[0] : {};
  } catch (err) {
    logger.error(err.stack);
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
      const [result] = await pool.query(sql, [
        ctx.request.query.keyword || '',
        ctx.request.query.keyword || '',
      ]);
      ctx.response.body = result;
    } else if (option === 'filter-user-by-id-list') {
      const sql = `
          select id, uuid, name, phone, email, enterprise_id
          from enterprise_user
          where enterprise_id in (${ctx.request.query.list || 0})`;
      const pool = mysql.promise();
      const [result] = await pool.query(sql);
      ctx.response.body = result;
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
    } else if (option === 'user-by-user-id-list') {
      const sql = `
          select id, uuid, name, phone, email, enterprise_id
          from enterprise_user
          where id in (${ctx.request.query.list || 0})
          `;
      const pool = mysql.promise();
      const [result] = await pool.query(sql);
      ctx.response.body = result;
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

router.get('/employer/:id', async (ctx) => {
  try {
    const option = ctx.request.query.option || '';
    if (option === '') {
      const sql = `
          select * from enterprise where id = ? and uuid = ? limit 1
          `;
      const pool = mysql.promise();
      const [result] = await pool.execute(sql, [parseInt(ctx.params.id), ctx.request.query.uuid]);
      ctx.response.body = result.length === 1 ? result[0] : {};
    } else if (option === 'user') {
      const sql = `
          select id, uuid, name, phone, email
          from enterprise_user
          where id = ?
            and uuid = ?
          `;
      const pool = mysql.promise();
      const [result] = await pool.execute(sql, [parseInt(ctx.params.id), ctx.request.query.uuid]);
      ctx.response.body = result.length === 1 ? result[0] : {};
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

router.get('/job/filter', async (ctx) => {
  try {
    const option = ctx.request.query.option || '';
    if (option === 'list-by-employer-id') {
      const sql = `
          select *
          from recruitment
          where enterprise_id = ?
            and enterprise_uuid = ?
          limit 200
          `;
      const pool = mysql.promise();
      const [result] = await pool.query(sql, [
        parseInt(ctx.request.query.id),
        ctx.request.query.uuid,
      ]);
      ctx.response.body = result;
    } else if (option === 'by-id-list') {
      const sql = `
          select id, uuid, name
          from recruitment
          where id in (${ctx.request.query.list})`;
      const pool = mysql.promise();
      const [result] = await pool.query(sql);
      ctx.response.body = result;
    } else if (option === 'by-fair-id') {
      const sql = `
          select *
          from recruitment
          where json_search(job_fair_id, "one", ?)
          order by id desc
          `;
      const pool = mysql.promise();
      const [rows] = await pool.query(sql, [ctx.request.query.fair_id]);
      ctx.response.body = rows;
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

router.get('/job/:id', async (ctx) => {
  try {
    const sql = `
        select *
        from recruitment
        where id = ? and uuid = ?
        limit 1
        `;
    const pool = mysql.promise();
    const [result] = await pool.query(sql, [parseInt(ctx.params.id), ctx.request.query.uuid]);
    ctx.response.body = result.length === 1 ? result[0] : {};
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.get('/resume/filter', async (ctx) => {
  try {
    const option = ctx.request.query.option || '';
    if (option === 'by-candidate') {
      const sql = 'select * from resume where common_user_id = ?';
      const pool = mysql.promise();
      const [rows] = await pool.query(sql, [parseInt(ctx.request.query.id)]);
      ctx.response.body = rows;
    }
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.get('/resume/:id', async (ctx) => {
  try {
    const sql = 'select * from resume where id = ? and uuid = ? limit 1';
    const pool = mysql.promise();
    const [rows] = await pool.query(sql, [parseInt(ctx.params.id), ctx.request.query.uuid]);
    ctx.response.body = rows.length === 1 ? rows[0] : {};
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.get('/send-in/filter', async (ctx) => {
  try {
    const option = ctx.request.query.option || '';
    if (option === '') {
      const sql = `
          select *
            -- , (select name from resume where id = d.resume_id ) as resume_name
            -- , (select name from recruitment where id = d.recruitment_id ) as recruitment_name
          from delivery as d
          where resume_id in (select id from resume where common_user_id = ?)
            and datime between ? and ?
          `;
      const pool = mysql.promise();
      const [rows] = await pool.query(sql, [
        parseInt(ctx.request.query.id),
        ctx.request.query.date_begin,
        ctx.request.query.date_end,
      ]);
      ctx.response.body = rows;
    } else if (option === 'list-by-employer') {
      const sql = `
          select id, datime, status
          from delivery
          where recruitment_uuid in (
              select uuid from recruitment where enterprise_id=? and enterprise_uuid=?)
            and datime between ? and ?
          order by id desc
          `;
      const pool = mysql.promise();
      const [result] = await pool.query(sql, [
        ctx.request.query.id,
        ctx.request.query.uuid,
        ctx.request.query.date_begin,
        ctx.request.query.date_end,
      ]);
      ctx.response.body = result;
    }
  } catch (err) {
    logger.error(err.stack);
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
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});
