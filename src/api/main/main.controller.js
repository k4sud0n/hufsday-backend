const database = require('../../database');

// 게시판 목록
exports.listSeoulfreePost = async (ctx) => {
  await database('seoulfree')
    .select('id', 'title')
    .orderBy('id', 'desc')
    .limit(4)
    .then((result) => {
      ctx.response.status = 200;
      ctx.body = { seoulfree: result };
    });
};
