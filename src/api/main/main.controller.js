const database = require('../../database');

// 서울캠 자유게시판 목록
exports.listPost = async (ctx) => {
  const seoulfree = await database('seoulfree')
    .select('id', 'title')
    .orderBy('id', 'desc')
    .limit(4)
    .then((result) => {
      return result;
    });

  const globalfree = await database('globalfree')
    .select('id', 'title')
    .orderBy('id', 'desc')
    .limit(4)
    .then((result) => {
      return result;
    });

  ctx.response.status = 200;
  ctx.body = { seoulfree, globalfree };
};
