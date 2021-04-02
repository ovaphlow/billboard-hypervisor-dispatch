const dayjs = require('dayjs');
const Router = require('@koa/router');

const logger = require('./logger');
const mysql = require('./mysql');

const router = new Router({
  prefix: '/api/bulletin',
});

module.exports = router;

router.get('/campus/filter', async (ctx) => {
  try {
    const option = ctx.request.query.option || '';
    if (option === '') {
      const sql = `
          select id, uuid, category, mis_user_id, date, time, title, school,
            address_level1, address_level2, address_level3, address_level4
          from campus
          where position(? in date) > 0
            and position(? in title) > 0
          order by id desc
          limit 20
          `;
      const pool = mysql.promise();
      const [result] = await pool.query(sql, [ctx.request.query.date, ctx.request.query.title]);
      ctx.response.body = result;
    }
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.get('/campus/:id', async (ctx) => {
  try {
    const sql = `
        select * from campus where id = ? and uuid = ? limit 1
        `;
    const pool = mysql.promise();
    const [result] = await pool.query(sql, [parseInt(ctx.params.id), ctx.request.query.uuid]);
    ctx.response.body = result.length === 1 ? result[0] : {};
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.put('/campus/:id', async (ctx) => {
  try {
    const sql = `
        update campus
        set title = ?
          , date = ?
          , time = ?
          , address_level1 = ?
          , address_level2 = ?
          , address_level3 = ?
          , address_level4 = ?
          , school = ?
          , content = ?
          , category = ?
        where id = ?
          and uuid = ?
        `;
    const pool = mysql.promise();
    await pool.execute(sql, [
      ctx.request.body.title,
      ctx.request.body.date,
      ctx.request.body.time,
      ctx.request.body.address_level1,
      ctx.request.body.address_level2,
      ctx.request.body.address_level3,
      ctx.request.body.address_level4,
      ctx.request.body.school,
      ctx.request.body.content,
      ctx.request.body.category,
      parseInt(ctx.params.id),
      ctx.request.query.uuid,
    ]);
    ctx.response.status = 200;
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.delete('/campus/:id', async (ctx) => {
  try {
    const sql = 'delete from campus where id = ? and uuid = ?';
    const pool = mysql.promise();
    await pool.execute(sql, [parseInt(ctx.params.id), ctx.request.query.uuid]);
    ctx.response.status = 200;
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.post('/campus', async (ctx) => {
  const sql = `
      insert into
        campus (uuid, mis_user_id, title, date, time,
          address_level1, address_level2, address_level3, address_level4,
          school, content, category)
        values (uuid(), 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
  const pool = mysql.promise();
  try {
    await pool.execute(sql, [
      ctx.request.body.title,
      ctx.request.body.date,
      ctx.request.body.time,
      ctx.request.body.address_level1,
      ctx.request.body.address_level2,
      ctx.request.body.address_level3,
      ctx.request.body.address_level4,
      ctx.request.body.school,
      ctx.request.body.content,
      ctx.request.body.category,
    ]);
    ctx.response.status = 200;
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

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

router.get('/notification/filter', async (ctx) => {
  try {
    const sql = `
        select id, uuid, category, title, date1, date2,
          address_level1, address_level2, publisher,
          qty, baomignfangshi
        from recommend
        where position(? in title) > 0
          and position(? in date1) > 0
          and position(? in date2) > 0
        order by id desc
        limit 100
        `;
    const pool = mysql.promise();
    const [result] = await pool.query(sql, [
      ctx.request.query.title,
      ctx.request.query.date,
      ctx.request.query.date,
    ]);
    ctx.response.body = result;
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.get('/notification/:id', async (ctx) => {
  try {
    const sql = 'select * from recommend where id = ? and uuid = ?';
    const pool = mysql.promise();
    const [result] = await pool.query(sql, [parseInt(ctx.params.id), ctx.request.query.uuid]);
    ctx.response.body = result.length === 1 ? result[0] : {};
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.put('/notification/:id', async (ctx) => {
  try {
    const sql = `
        update recommend
        set category = ?
          , title = ?
          , date1 = ?
          , date2 = ?
          , address_level1 = ?
          , address_level2 = ?
          , publisher = ?
          , qty = ?
          , baomignfangshi = ?
          , content = ?
        where id = ?
          and uuid = ?
        `;
    const pool = mysql.promise();
    await pool.execute(sql, [
      ctx.request.body.category,
      ctx.request.body.title,
      ctx.request.body.date1,
      ctx.request.body.date2,
      ctx.request.body.address_level1,
      ctx.request.body.address_level2,
      ctx.request.body.publisher,
      ctx.request.body.qty,
      ctx.request.body.baomingfangshi,
      ctx.request.body.content,
      parseInt(ctx.params.id),
      ctx.request.query.uuid,
    ]);
    ctx.response.status = 200;
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.delete('/notification/:id', async (ctx) => {
  try {
    const sql = 'delete from recommend where id = ? and uuid = ?';
    const pool = mysql.promise();
    await pool.execute(sql, [parseInt(ctx.params.id), ctx.request.query.uuid]);
    ctx.response.status = 200;
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.post('/notification', async (ctx) => {
  try {
    const sql = `
        insert into
          recommend (uuid, category, title, date1, date2, address_level1,
            address_level2, publisher, qty, baomignfangshi, content)
        value
          (uuid(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
    const pool = mysql.promise();
    await pool.execute(sql, [
      ctx.request.body.category,
      ctx.request.body.title,
      ctx.request.body.date1,
      ctx.request.body.date2,
      ctx.request.body.address_level1,
      ctx.request.body.address_level2,
      ctx.request.body.publisher,
      ctx.request.body.qty,
      ctx.request.body.baomingfangshi,
      ctx.request.body.content,
    ]);
    ctx.response.status = 200;
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.get('/topic/filter', async (ctx) => {
  try {
    const sql = `
        select id, uuid, date, time, mis_user_id, tag, title
        from topic
        where position(? in date) > 0
          and position(? in title) > 0
        order by id desc
        limit 100
        `;
    const pool = mysql.promise();
    const [result] = await pool.query(sql, [ctx.request.query.date, ctx.request.query.title]);
    ctx.response.body = result;
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.get('/topic/:id', async (ctx) => {
  try {
    const sql = 'select * from topic where id = ? and uuid = ? limit 1';
    const pool = mysql.promise();
    const [result] = await pool.query(sql, [parseInt(ctx.params.id), ctx.request.query.uuid]);
    ctx.response.body = result.length === 1 ? result[0] : {};
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.put('/topic/:id', async (ctx) => {
  try {
    const sql = `
        update topic
        set title = ?
          , tag = ?
          , date = ?
          , time = ?
          , content=?
        where id = ?
          and uuid = ?
        `;
    const pool = mysql.promise();
    await pool.execute(sql, [
      ctx.request.body.title,
      ctx.request.body.tag,
      ctx.request.body.date,
      ctx.request.body.time,
      ctx.request.body.content,
      parseInt(ctx.params.id),
      ctx.request.query.uuid,
    ]);
    ctx.response.status = 200;
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.delete('/topic/:id', async (ctx) => {
  try {
    const sql = 'delete from topic where id = ? and uuid = ?';
    const pool = mysql.promise();
    await pool.execute(sql, [parseInt(ctx.params.id), ctx.request.query.uuid]);
    ctx.response.status = 200;
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.post('/topic', async (ctx) => {
  try {
    const sql = `
        insert into
          topic (uuid, mis_user_id, tag, title, date, time, content)
          values (uuid(), 0, ?,  ?, ?, ?, ?)
        `;
    const pool = mysql.promise();
    await pool.execute(sql, [
      ctx.request.body.tag,
      ctx.request.body.title,
      ctx.request.body.date,
      ctx.request.body.time,
      ctx.request.body.content,
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
