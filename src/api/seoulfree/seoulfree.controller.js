const database = require('../../database');

// 게시판 목록
exports.listPost = async (ctx) => {
  if (!ctx.query.page) {
    ctx.query.page = 1;
  }

  await database('seoulfree')
    .select(
      'seoulfree.id',
      'seoulfree.title',
      'seoulfree.content',
      'seoulfree.created',
      'seoulfree.view_count',
      'seoulfree.thumbs_up'
    )
    .count('seoulfree_comment.post_id', { as: 'number_of_comments' })
    .leftJoin('seoulfree_comment', function () {
      this.on('seoulfree.id', '=', 'seoulfree_comment.post_id');
    })
    .groupBy('seoulfree.id')
    .orderBy('id', 'desc')
    .limit(20)
    .offset((ctx.query.page - 1) * 20)
    .then((result) => {
      ctx.response.status = 200;
      ctx.body = result;
    });
};

// 게시판 쓰기
exports.createPost = async (ctx) => {
  const { title, content } = ctx.request.body;
  const { id } = ctx.state.user;

  await database('seoulfree')
    .insert({
      title: title,
      content: content,
      user_id: id,
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
    .select(
      'seoulfree.id',
      'seoulfree.title',
      'seoulfree.content',
      'seoulfree.created',
      'seoulfree.user_id',
      'seoulfree.view_count',
      'seoulfree.thumbs_up',
      'seoulfree.thumbs_down'
    )
    .count('seoulfree_comment.post_id', { as: 'number_of_comments' })
    .leftJoin('seoulfree_comment', function () {
      this.on('seoulfree.id', '=', 'seoulfree_comment.post_id');
    })
    .where('seoulfree.id', id)
    .then((result) => {
      ctx.response.status = 200;
      ctx.body = result;
    });
};

// 게시물 삭제
exports.deletePost = async (ctx) => {
  const { id } = ctx.params;

  await database('seoulfree')
    .where('id', '=', id)
    .del()
    .then((result) => {
      ctx.response.status = 200;
      ctx.body = result;
    });
};

// 게시물 수정
exports.updatePost = (ctx) => {
  ctx.body = 'updated';
};

// 게시물 추천
exports.postThumbsUp = async (ctx) => {
  const { id } = ctx.params;

  await database('seoulfree')
    .where('id', '=', id)
    .increment('thumbs_up', 1)
    .then((result) => {
      ctx.response.status = 200;
      ctx.body = result;
    });
};

// 게시물 비추천
exports.postThumbsDown = async (ctx) => {
  const { id } = ctx.params;

  await database('seoulfree')
    .where('id', '=', id)
    .increment('thumbs_down', 1)
    .then((result) => {
      ctx.response.status = 200;
      ctx.body = result;
    });
};

// 댓글 목록
exports.listComment = async (ctx) => {
  const { id } = ctx.params;

  await database('seoulfree_comment')
    .select(
      'seoulfree_comment.post_id',
      'seoulfree_comment.id',
      'seoulfree_comment.user_id',
      'seoulfree_comment.content',
      'seoulfree_comment.created',
      'seoulfree_comment.thumbs_up'
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
  const { content } = ctx.request.body;
  const user_id = ctx.state.user.id;

  await database('seoulfree_comment')
    .insert({
      post_id: id,
      content: content,
      user_id: user_id,
    })
    .then((result) => {
      ctx.response.status = 200;
      ctx.body = result;
    });
};

// 댓글 삭제
exports.deleteComment = async (ctx) => {
  const { id, comment_id } = ctx.params;

  await database('seoulfree_comment')
    .where(function () {
      this.where('id', '=', comment_id).andWhere('post_id', '=', id);
    })
    .del()
    .then((result) => {
      ctx.response.status = 200;
      ctx.body = result;
    });
};

// 댓글 수정
exports.updateComment = (ctx) => {
  ctx.body = 'updated';
};

// 댓글 추천
exports.commentThumbsUp = async (ctx) => {
  const { comment_id } = ctx.params;

  await database('seoulfree_comment')
    .where('id', '=', comment_id)
    .increment('thumbs_up', 1)
    .then((result) => {
      ctx.response.status = 200;
      ctx.body = result;
    });
};
