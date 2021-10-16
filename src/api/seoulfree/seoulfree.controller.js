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
    .select(
      'seoulfree.id',
      'seoulfree.title',
      'seoulfree.content',
      'seoulfree.created'
    )
    .count('seoulfree_comment.post_id', { as: 'number_of_comments' })
    .leftJoin('seoulfree_comment', function () {
      this.on('seoulfree.id', '=', 'seoulfree_comment.post_id');
    })
    .groupBy('seoulfree.id')
    .limit(20)
    .then((result) => {
      ctx.response.status = 200;
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

// 댓글 목록
exports.listComment = async (ctx) => {
  const { id } = ctx.params;

  await database('seoulfree_comment')
    .select(
      'seoulfree_comment.post_id',
      'seoulfree_comment.id',
      'seoulfree_comment.content',
      'seoulfree_comment.created'
    )
    .join('seoulfree', function () {
      this.on('seoulfree_comment.post_id', '=', 'seoulfree.id');
    })
    .where('seoulfree.id', id)
    .then((result) => {
      ctx.body = result;
    });
};

// 댓글 등록
exports.createComment = async (ctx) => {
  const { id } = ctx.params;
  const { content, nickname } = ctx.request.body;

  console.log();

  await database('seoulfree_comment')
    .insert({
      post_id: id,
      content: content,
      nickname: nickname,
    })
    .then((result) => {
      ctx.response.status = 200;
      ctx.body = result;
    });
};
