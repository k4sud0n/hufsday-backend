const database = require('../../database');

const sendNotification = require('../../lib/sendNotification');

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

exports.searchPost = async (ctx) => {
  const { title } = ctx.params;

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
    .where('title', 'like', `%${title}%`)
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
exports.detailedPost = async (ctx) => {
  const { id } = ctx.params;

  if (ctx.cookies.get('seoulfree_' + id) == undefined) {
    ctx.cookies.set('seoulfree_' + id, 'view', {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    await database('seoulfree').increment('view_count', 1);
  }

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

  const postWriterId = database('seoulfree')
    .select('user_id')
    .where('seoulfree.id', id)
    .then((result) => result[0].user_id);

  if ((await postWriterId) == ctx.state.user.id) {
    await database('seoulfree')
      .where('id', '=', id)
      .del()
      .then((result) => {
        ctx.response.status = 200;
        ctx.body = result;
      });
  } else {
    ctx.response.status = 401;
    ctx.body = '권한이 없습니다.';
  }
};

// 게시물 수정
exports.updatePost = async (ctx) => {
  const { title, content } = ctx.request.body;
  const { id } = ctx.params;

  const postWriterId = database('seoulfree')
    .select('user_id')
    .where('seoulfree.id', id)
    .then((result) => result[0].user_id);

  if ((await postWriterId) == ctx.state.user.id) {
    await database('seoulfree')
      .where('id', '=', id)
      .update({
        title: title,
        content: content,
      })
      .then((result) => {
        ctx.response.status = 200;
        ctx.body = result;
      });
  } else {
    ctx.response.status = 401;
    ctx.body = '권한이 없습니다.';
  }
};

// 게시물 추천
exports.postThumbsUp = async (ctx) => {
  const { id } = ctx.params;

  const postWriterId = database('seoulfree')
    .select('user_id')
    .where('seoulfree.id', id)
    .then((result) => result[0].user_id);

  const checkThumbsUp = database('seoulfree_thumbs')
    .select('thumbs_up')
    .where('post_id', id)
    .andWhere('user_id', ctx.state.user.id)
    .then((result) => result);

  if ((await postWriterId) !== ctx.state.user.id) {
    if (
      (await checkThumbsUp).length == 0 ||
      (await checkThumbsUp)[0].thumbs_up == 0
    ) {
      if ((await checkThumbsUp).length == 0) {
        await database('seoulfree_thumbs').insert({
          post_id: id,
          user_id: ctx.state.user.id,
          thumbs_up: 1,
        });
      } else {
        await database('seoulfree_thumbs').update('thumbs_up', 1);
      }

      await database('seoulfree')
        .where('id', '=', id)
        .increment('thumbs_up', 1)
        .then((result) => {
          ctx.response.status = 200;
          ctx.body = result;
        });
    } else {
      ctx.response.status = 401;
      ctx.body = 'thumbs_up_duplicate';
    }
  } else {
    ctx.response.status = 401;
    ctx.body = 'thumbs_up_own';
  }
};

// 게시물 비추천
exports.postThumbsDown = async (ctx) => {
  const { id } = ctx.params;

  const postWriterId = database('seoulfree')
    .select('user_id')
    .where('seoulfree.id', id)
    .then((result) => result[0].user_id);

  const checkThumbsDown = database('seoulfree_thumbs')
    .select('thumbs_down')
    .where('post_id', id)
    .andWhere('user_id', ctx.state.user.id)
    .then((result) => result);

  if ((await postWriterId) !== ctx.state.user.id) {
    if (
      (await checkThumbsDown).length == 0 ||
      (await checkThumbsDown)[0].thumbs_down == 0
    ) {
      if ((await checkThumbsDown).length == 0) {
        await database('seoulfree_thumbs').insert({
          post_id: id,
          user_id: ctx.state.user.id,
          thumbs_down: 1,
        });
      } else {
        await database('seoulfree_thumbs').update('thumbs_down', 1);
      }

      await database('seoulfree')
        .where('id', '=', id)
        .increment('thumbs_down', 1)
        .then((result) => {
          ctx.response.status = 200;
          ctx.body = result;
        });
    } else {
      ctx.response.status = 401;
      ctx.body = 'thumbs_down_duplicate';
    }
  } else {
    ctx.response.status = 401;
    ctx.body = 'thumbs_down_own';
  }
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
      'seoulfree_comment.thumbs_up',
      'seoulfree_comment.parent_id'
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
  const { parentId, postCreatorId, content } = ctx.request.body;
  const user_id = ctx.state.user.id;

  // 일반 댓글일 경우
  if (parentId == undefined) {
    if (postCreatorId !== ctx.state.user.id) {
      sendNotification(id, user_id, postCreatorId, content);
    }

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
  } else {
    // 답글일 경우
    const commentCreatorId = database('seoulfree_comment')
      .select('user_id')
      .where('id', parentId)
      .then((result) => result[0].user_id);

    if ((await commentCreatorId) !== ctx.state.user.id) {
      sendNotification(id, user_id, await commentCreatorId, content);
    }

    await database('seoulfree_comment')
      .insert({
        post_id: id,
        content: content,
        user_id: user_id,
        parent_id: parentId,
      })
      .then((result) => {
        ctx.response.status = 200;
        ctx.body = result;
      });
  }
};

// 댓글 삭제
exports.deleteComment = async (ctx) => {
  const { id, comment_id } = ctx.params;

  const commentWriterId = database('seoulfree_comment')
    .select('user_id')
    .where('id', comment_id)
    .then((result) => result[0].user_id);

  if ((await commentWriterId) == ctx.state.user.id) {
    await database('seoulfree_comment')
      .where(function () {
        this.where('id', '=', comment_id).andWhere('post_id', '=', id);
      })
      .update({ content: '삭제된 댓글입니다.' })
      .then((result) => {
        ctx.response.status = 200;
        ctx.body = result;
      });
  } else {
    ctx.response.status = 401;
    ctx.body = '권한이 없습니다.';
  }
};

// 댓글 추천
exports.commentThumbsUp = async (ctx) => {
  const { comment_id } = ctx.params;

  const commentWriterId = database('seoulfree_comment')
    .select('user_id')
    .where('id', comment_id)
    .then((result) => result[0].user_id);

  const checkThumbsUp = database('seoulfree_comment_thumbs')
    .select('thumbs_up')
    .where('comment_id', comment_id)
    .andWhere('user_id', ctx.state.user.id)
    .then((result) => result);

  if ((await commentWriterId) !== ctx.state.user.id) {
    if (
      (await checkThumbsUp).length == 0 ||
      (await checkThumbsUp)[0].thumbs_up == 0
    ) {
      await database('seoulfree_comment_thumbs').insert({
        comment_id: comment_id,
        user_id: ctx.state.user.id,
        thumbs_up: 1,
      });

      await database('seoulfree_comment')
        .where('id', '=', comment_id)
        .increment('thumbs_up', 1)
        .then((result) => {
          ctx.response.status = 200;
          ctx.body = result;
        });
    } else {
      ctx.response.status = 401;
      ctx.body = 'thumbs_up_duplicate';
    }
  } else {
    ctx.response.status = 401;
    ctx.body = 'thumbs_up_own';
  }
};
