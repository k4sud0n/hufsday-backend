const database = require('../../database');

const sendNotification = require('../../lib/sendNotification');

// 게시판 목록
exports.listPost = async (ctx) => {
  if (!ctx.query.page) {
    ctx.query.page = 1;
  }

  await database('globalfree')
    .select(
      'globalfree.id',
      'globalfree.title',
      'user.major',
      'globalfree.created',
      'globalfree.view_count',
      'globalfree.thumbs_up'
    )
    .count('globalfree_comment.post_id', { as: 'number_of_comments' })
    .leftJoin('globalfree_comment', function () {
      this.on('globalfree_comment.post_id', '=', 'globalfree.id');
    })
    .leftJoin('user', function () {
      this.on('user.id', '=', 'globalfree.user_id');
    })
    .groupBy('globalfree.id')
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

  await database('globalfree')
    .select(
      'globalfree.id',
      'globalfree.title',
      'user.major',
      'globalfree.created',
      'globalfree.view_count',
      'globalfree.thumbs_up'
    )
    .where('title', 'like', `%${title}%`)
    .count('globalfree_comment.post_id', { as: 'number_of_comments' })
    .leftJoin('globalfree_comment', function () {
      this.on('globalfree.id', '=', 'globalfree_comment.post_id');
    })
    .leftJoin('user', function () {
      this.on('user.id', '=', 'globalfree.user_id');
    })
    .groupBy('globalfree.id')
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

  await database('globalfree')
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

  const checkIfPost = await database('globalfree')
    .select('id')
    .where('id', id)
    .then((result) => {
      return result;
    });

  if (checkIfPost.length !== 0) {
    if (ctx.cookies.get('globalfree_' + id) == undefined) {
      ctx.cookies.set('globalfree_' + id, 'view', {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });

      await database('globalfree').increment('view_count', 1);
    }

    await database('globalfree')
      .select(
        'globalfree.id',
        'globalfree.title',
        'globalfree.content',
        'user.major',
        'globalfree.created',
        'globalfree.user_id',
        'globalfree.view_count',
        'globalfree.thumbs_up',
        'globalfree.thumbs_down'
      )
      .count('globalfree_comment.post_id', { as: 'number_of_comments' })
      .leftJoin('globalfree_comment', function () {
        this.on('globalfree.id', '=', 'globalfree_comment.post_id');
      })
      .leftJoin('user', function () {
        this.on('user.id', '=', 'globalfree.user_id');
      })
      .where('globalfree.id', id)
      .then((result) => {
        ctx.response.status = 200;
        ctx.body = result;
      });
  } else {
    ctx.response.status = 404;
  }
};

// 게시물 삭제
exports.deletePost = async (ctx) => {
  const { id } = ctx.params;

  const postWriterId = database('globalfree')
    .select('user_id')
    .where('globalfree.id', id)
    .then((result) => result[0].user_id);

  if ((await postWriterId) == ctx.state.user.id) {
    await database('globalfree')
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

  const postWriterId = database('globalfree')
    .select('user_id')
    .where('globalfree.id', id)
    .then((result) => result[0].user_id);

  if ((await postWriterId) == ctx.state.user.id) {
    await database('globalfree')
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

  const postWriterId = database('globalfree')
    .select('user_id')
    .where('globalfree.id', id)
    .then((result) => result[0].user_id);

  const checkThumbsUp = database('globalfree_thumbs')
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
        await database('globalfree_thumbs').insert({
          post_id: id,
          user_id: ctx.state.user.id,
          thumbs_up: 1,
        });
      } else {
        await database('globalfree_thumbs').update('thumbs_up', 1);
      }

      await database('globalfree')
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

  const postWriterId = database('globalfree')
    .select('user_id')
    .where('globalfree.id', id)
    .then((result) => result[0].user_id);

  const checkThumbsDown = database('globalfree_thumbs')
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
        await database('globalfree_thumbs').insert({
          post_id: id,
          user_id: ctx.state.user.id,
          thumbs_down: 1,
        });
      } else {
        await database('globalfree_thumbs').update('thumbs_down', 1);
      }

      await database('globalfree')
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

  await database('globalfree_comment')
    .select(
      'globalfree_comment.post_id',
      'globalfree_comment.id',
      'globalfree_comment.user_id',
      'user.major',
      'globalfree_comment.content',
      'globalfree_comment.created',
      'globalfree_comment.thumbs_up',
      'globalfree_comment.parent_id'
    )
    .join('globalfree', function () {
      this.on('globalfree_comment.post_id', '=', 'globalfree.id');
    })
    .leftJoin('user', function () {
      this.on('user.id', '=', 'globalfree_comment.user_id');
    })
    .where('globalfree.id', id)
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
      sendNotification('globalfree', id, user_id, postCreatorId, content);
    }

    await database('globalfree_comment')
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
    const commentCreatorId = database('globalfree_comment')
      .select('user_id')
      .where('id', parentId)
      .then((result) => result[0].user_id);

    if ((await commentCreatorId) !== ctx.state.user.id) {
      sendNotification(
        'globalfree',
        id,
        user_id,
        await commentCreatorId,
        content
      );
    }

    await database('globalfree_comment')
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

  const commentWriterId = database('globalfree_comment')
    .select('user_id')
    .where('id', comment_id)
    .then((result) => result[0].user_id);

  if ((await commentWriterId) == ctx.state.user.id) {
    await database('globalfree_comment')
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

  const commentWriterId = database('globalfree_comment')
    .select('user_id')
    .where('id', comment_id)
    .then((result) => result[0].user_id);

  const checkThumbsUp = database('globalfree_comment_thumbs')
    .select('thumbs_up')
    .where('comment_id', comment_id)
    .andWhere('user_id', ctx.state.user.id)
    .then((result) => result);

  if ((await commentWriterId) !== ctx.state.user.id) {
    if (
      (await checkThumbsUp).length == 0 ||
      (await checkThumbsUp)[0].thumbs_up == 0
    ) {
      await database('globalfree_comment_thumbs').insert({
        comment_id: comment_id,
        user_id: ctx.state.user.id,
        thumbs_up: 1,
      });

      await database('globalfree_comment')
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
