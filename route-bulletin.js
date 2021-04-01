const dayjs = require('dayjs');
const Router = require('@koa/router');

const logger = require('./logger');
const mysql = require('./mysql');

const router = new Router({
  prefix: '/api/bulletin',
});

module.exports = router;

router.get('/fair/filter', async (ctx) => {
  try {
    const sql = `
        select id, title, content, datime, status
        from job_fair
        order by id desc
        limit 100
        `;
    const pool = mysql.promise();
    const [result] = await pool.query(sql);
    ctx.response.body = result;
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.get('/fair/:id', async (ctx) => {
  try {
    const sql = `
        select id, title, content, datime, status
        from job_fair
        where id = ?
        limit 1
        `;
    const pool = mysql.promise();
    const [result] = await pool.query(sql, [parseInt(ctx.params.id)]);
    ctx.response.body = result.length === 1 ? result[0] : {};
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.put('/fair/:id', async (ctx) => {
  try {
    const sql = `
        update job_fair
        set title = ?, content = ?, datime = ?, status = ?
        where id = ?
        `;
    const pool = mysql.promise();
    await pool.query(sql, [
      ctx.request.body.title,
      ctx.request.body.content,
      ctx.request.body.datime,
      ctx.request.body.status,
      parseInt(ctx.params.id),
    ]);
    ctx.response.status = 200;
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.delete('/fair/:id', async (ctx) => {
  try {
    const sql = `
        delete from job_fair where id = ?
        `;
    const pool = mysql.promise();
    await pool.query(sql, [parseInt(ctx.params.id)]);
    ctx.response.status = 200;
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.post('/fair', async (ctx) => {
  try {
    const sql = `
        insert into job_fair
          (title, content, datime)
        values (?, ?, ?);
        `;
    const pool = mysql.promise();
    await pool.query(sql, [
      ctx.request.body.title,
      ctx.request.body.content,
      ctx.request.body.datime,
    ]);
    ctx.response.status = 200;
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

/**
 * 原bulletin的内容
 */
router.get('/statistic', async (ctx) => {
  try {
    const option = ctx.request.query.option || '';
    if (option === 'tuijian-today') {
      const sql = 'select count(*) as qty from recommend where position(? in date_create) > 0';
      const pool = mysql.promise();
      const [rows] = await pool.query(sql, [dayjs().format('YYYY-MM-DD')]);
      ctx.response.body = rows[0].qty;
    } else if (option === 'tuijian-all') {
      const sql = 'select count(*) as qty from recommend';
      const pool = mysql.promise();
      const [rows] = await pool.query(sql);
      ctx.response.body = rows[0].qty;
    }
  } catch (err) {
    logger.error(err);
    ctx.response.status = 500;
  }
});

/**
 * 原bulletin的内容
 */
router.get('/:id', async (ctx) => {
  const pool = mysql.promise();
  try {
    const sql = `
      select * from bulletin where id = ? and uuid = ? limit 1
    `;
    const [rows] = await pool.query(sql, [parseInt(ctx.params.id, 10), ctx.request.query.uuid]);
    ctx.response.body = {
      message: '',
      content: rows.length === 1 ? rows[0] : {},
    };
  } catch (err) {
    logger.error(err);
    ctx.response.body = { message: '服务器错误', content: '' };
  }
});

/**
 * 原bulletin的内容
 */
router.put('/:id', async (ctx) => {
  const pool = mysql.promise();
  try {
    const sql = `
      update bulletin
      set uuid = ?, title = ?, dday = ?, receiver = ?, doc = ?
      where id = ? and uuid = ?
    `;
    await pool.query(sql, [
      ctx.request.body.uuid,
      ctx.request.body.title,
      ctx.request.body.dday,
      ctx.request.body.receiver,
      ctx.request.body.doc,
      parseInt(ctx.params.id, 10),
      ctx.request.query.uuid,
    ]);
    ctx.response.body = { message: '', content: '' };
  } catch (err) {
    logger.error(err);
    ctx.response.body = { message: '服务器错误', content: '' };
  }
});

/**
 * 原bulletin的内容
 */
router.get('/', async (ctx) => {
  const pool = mysql.promise();
  try {
    const sql = `
      select *
      from bulletin
      order by id desc
      limit 100
    `;
    const [rows] = await pool.query(sql);
    ctx.response.body = { message: '', content: rows };
  } catch (err) {
    logger.error(err);
    ctx.response.body = { message: '服务器错误', content: '' };
  }
});

/**
 * 原bulletin的内容
 */
router.post('/', async (ctx) => {
  const pool = mysql.promise();
  try {
    const sql = `
      insert into
        bulletin (uuid, title, dday, receiver, doc)
        values (?, ?, ?, ?, ?)
    `;
    const [rows] = await pool.query(sql, [
      ctx.request.body.uuid,
      ctx.request.body.title,
      ctx.request.body.dday,
      ctx.request.body.receiver,
      ctx.request.body.doc,
    ]);
    ctx.response.body = { message: '', content: rows };
  } catch (err) {
    logger.error(err);
    ctx.response.body = { message: '服务器错误', content: '' };
  }
});
