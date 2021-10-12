const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();
const api = require('./api');

app.use(bodyParser());
router.use('/api', api.routes());

app
  .use(cors({ origin: 'http://localhost:3000' }))
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(4000, () => {
  console.log('HUFSDAY server is listening to port 4000');
});
