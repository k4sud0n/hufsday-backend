const Koa = require('koa');
const app = new Koa();

app.use((ctx) => {
  ctx.body = 'Hello world';
});

app.listen(4000, () => {
  console.log('Server running on port 4000');
});
