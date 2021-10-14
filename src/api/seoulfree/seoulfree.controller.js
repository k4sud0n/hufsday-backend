const database = require('../../database');

// 게시판 목록
exports.listPost = async (ctx) => {
  // await database('seoulfree')
  //   .select('id', 'title', 'content', 'created')
  //   .orderBy('id', 'desc')
  //   .limit(20)
  //   .offset((ctx.query.page - 1) * 20)
  //   .then((result) => {
  //     ctx.response.status = 200;
  //     ctx.body = result;
  //   });

  await database('seoulfree')
    .select('*')
    .orderBy('id', 'desc')
    .where(function () {
      this.where('id', '>', (ctx.query.page - 1) * 20);
    })
    .limit(20)
    .then((result) => {
      ctx.body = result;
    });
};

// 게시판 쓰기
exports.createPost = async (ctx) => {
  const { title, content } = ctx.request.body;
  const { nickname } = ctx.state.user;

  await database('seoulfree')
    .insert({
      title: title,
      content: content,
      nickname: nickname,
    })
    .then((result) => {
      ctx.response.status = 200;
      ctx.body = result;
    });
};

// 게시물 상세
exports.listDetailedPost = async (ctx) => {
  const { id } = ctx.params;

  await database('seoulfree')
    .select('id', 'title', 'content', 'created')
    .where('id', id)
    .then((result) => {
      ctx.body = result;
    });
};

// 게시물 삭제
exports.deletePost = (ctx) => {
  ctx.body = 'deleted';
};

// 게시물 수정
exports.updatePost = (ctx) => {
  ctx.body = 'updated';
};
