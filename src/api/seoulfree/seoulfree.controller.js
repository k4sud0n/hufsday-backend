const database = require('../../database');

exports.listPost = async (ctx) => {
  // 일반 쿼리
  await database('board')
    .select('*')
    .orderBy('id', 'desc')
    .limit(20)
    .offset((ctx.query.page - 1) * 20)
    .then((result) => {
      ctx.body = result;
    });

  // 쿼리 최적화
  // await database('board')
  //   .select('*')
  //   .orderBy('id', 'desc')
  //   .where(function () {
  //     this.where('id', '>', ctx.query.page - 20);
  //   })
  //   .limit(20)
  //   .then((result) => {
  //     ctx.body = result;
  //   });
};

exports.createPost = async (ctx) => {
  const { title, content } = ctx.request.body;

  await database('board')
    .insert({
      title: title,
      content: content,
    })
    .then((result) => {
      ctx.body = result;
    });
};

exports.listDetailedPost = async (ctx) => {
  await database('board')
    .select('*')
    .where('id', ctx.params.id)
    .then((result) => {
      ctx.body = result;
    });
};

exports.deletePost = (ctx) => {
  ctx.body = 'deleted';
};

exports.updatePost = (ctx) => {
  ctx.body = 'updated';
};
