const Router = require('@koa/router');

const logger = require('./logger');
const mysql = require('./mysql');

const router = new Router({
  prefix: '/api/miscellaneous',
});

module.exports = router;

router.get('/feedback/filter', async (ctx) => {
  try {
    const sql = `
        select *
        from feedback
        where category = ?
        order by id desc
        limit 100
        `;
    const pool = mysql.promise();
    const [result] = await pool.query(sql, [ctx.request.query.category]);
    ctx.response.body = result;
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.put('/feedback/:id', async (ctx) => {
  try {
    const option = ctx.request.query.option || '';
    if (option === 'reply') {
      const sql1 = `
        insert into
          sys_message (user_id, category, title, content, datime, status, user_category)
          values (?, ?, ?, ?, ?, '未读', ?)
        `;
      const pool = mysql.promise();
      await pool.execute(sql1, [
        parseInt(ctx.request.body.user_id),
        ctx.request.body.category,
        ctx.request.body.title,
        ctx.request.body.content,
        ctx.request.body.datime,
        ctx.request.body.user_category,
      ]);
      const sql2 = `
          update feedback
          set status = '已处理'
          where id = ?
          `;
      await pool.execute(sql2, [parseInt(ctx.params.id)]);
      ctx.response.status = 200;
    }
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.get('/staff/filter', async (ctx) => {
  try {
    const sql = `
        select id, uuid, username, name
        from mis_user
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

router.get('/staff/:id', async (ctx) => {
  try {
    const sql = 'select id, uuid, username, name from mis_user where id = ? and uuid = ? limit 1';
    const pool = mysql.promise();
    const [result] = await pool.query(sql, [parseInt(ctx.params.id), ctx.request.query.uuid]);
    ctx.response.body = result.length === 1 ? result[0] : {};
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.put('/staff/:id', async (ctx) => {
  try {
    const sql = `
        update mis_user
        set username = ?
          , name = ?
        where id = ?
          and uuid = ?
        `;
    const pool = mysql.promise();
    await pool.execute(sql, [
      ctx.request.body.username,
      ctx.request.body.name,
      parseInt(ctx.params.id),
      ctx.request.query.uuid,
    ]);
    ctx.response.status = 200;
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.delete('/staff/:id', async (ctx) => {
  try {
    const sql = 'delete from mis_user where id = ? and uuid = ?';
    const pool = mysql.promise();
    await pool.execute(sql, [parseInt(ctx.params.id), ctx.request.query.uuid]);
    ctx.response.status = 200;
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});

router.post('/staff', async (ctx) => {
  try {
    const sql = `
        insert into
          mis_user (uuid, username, password, name)
          values (uuid(), ?, ?, ?)
        `;
    const pool = mysql.promise();
    await pool.execute(sql, [
      ctx.request.body.username,
      ctx.request.body.password,
      ctx.request.body.name,
    ]);
    ctx.response.status = 200;
  } catch (err) {
    logger.error(err.stack);
    ctx.response.status = 500;
  }
});
