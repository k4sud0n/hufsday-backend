const database = require('../../database');

// 쪽지 목록
exports.listMessage = async (ctx) => {
  // SELECT *, CASE WHEN parent_id=0 THEN id ELSE parent_id END AS m_id FROM message;
  const { id } = ctx.state.user;

  let messageList = [];

  const messageIds = await database('message')
    .select('id')
    .where(function () {
      this.where('sender_id', id).orWhere('receiver_id', id);
    })
    .andWhere('parent_id', 0)
    .then((result) => {
      return result.map((result) => result.id);
    });

  for (const messageId of await messageIds) {
    // SELECT * FROM message WHERE (sender_id = 1 OR receiver_id = 1) AND (id = 1 OR parent_id = 1);
    // SELECT COUNT(id) FROM message WHERE (sender_id = 1 OR receiver_id = 1) AND (id = 1 OR parent_id = 1) AND (readed = 0);
    // SELECT *, SUM(CASE WHEN readed=0 THEN 1 ELSE 0 END) AS unreaded_message FROM message WHERE (sender_id = 1 OR receiver_id = 1) AND (id = 1 OR parent_id = 1) GROUP BY id;
    // SELECT CASE WHEN parent_id=0 THEN id ELSE parent_id END AS m_id, GROUP_CONCAT(CASE WHEN readed=0 THEN content ELSE '' END ORDER BY readed, id SEPARATOR '\r\n') AS contents, SUM(CASE WHEN readed=0 THEN 1 ELSE 0 END) AS unreaded_message FROM message GROUP BY m_id;

    await database('message')
      .select('*')
      .sum({
        unreaded: database.raw(
          'CASE WHEN (receiver_id = :id) AND (id = :messageId OR parent_id = :messageId) AND readed=0 THEN 1 ELSE 0 END',
          {
            id: id,
            messageId: messageId,
          }
        ),
      })
      .where(function () {
        this.where('sender_id', id).orWhere('receiver_id', id);
      })
      .where(function () {
        this.where('id', messageId).orWhere('parent_id', messageId);
      })
      .groupBy('id')
      .orderBy('id', 'desc')
      .limit(1)
      .then((result) => {
        messageList.push(result[0]);
      });
  }

  ctx.response.status = 200;
  ctx.body = messageList.reverse();
};

// 안읽은 쪽지 개수
exports.countMessage = async (ctx) => {
  const { id } = ctx.state.user;

  await database('message')
    .count('id')
    .where('receiver_id', id)
    .andWhere('readed', 0)
    .then((result) => {
      ctx.response.status = 200;
      ctx.body = result;
    });
};

// 쪽지 상세
exports.detailedMessage = async (ctx) => {
  const { id } = ctx.params;
  const user_id = ctx.state.user.id;

  const checkIfNotValid = await database('message')
    .select('id')
    .where('id', id)
    .then((result) => {
      return result.length === 0;
    });

  if (checkIfNotValid) {
    ctx.response.status = 404;
  } else {
    const checkParentOrChild = await database('message')
      .select('parent_id', 'id')
      .where('id', id)
      .then((result) => {
        if (result[0].parent_id === 0) {
          return ['parent', result[0].id];
        } else {
          return ['child', result[0].parent_id];
        }
      });

    // 쪽지 읽음 처리
    await database('message')
      .where('receiver_id', user_id)
      .where(function () {
        this.where('id', id).orWhere('parent_id', id);
      })
      .update('readed', 1);

    await database('message')
      .select(
        'id',
        'parent_id',
        'sender_id',
        'receiver_id',
        'content',
        'created'
      )
      .where(function () {
        this.where('id', id).orWhere('parent_id', id);
      })
      .where(function () {
        this.where('sender_id', user_id).orWhere('receiver_id', user_id);
      })
      .orderBy('id', 'desc')
      .then((result) => {
        if (result.length === 0) {
          ctx.response.status = 404;
        } else {
          if (checkParentOrChild[0] === 'parent') {
            ctx.response.status = 200;
            ctx.body = result;
          } else {
            ctx.body = checkParentOrChild[1];
          }
        }
      });
  }
};

// 쪽지 보내기
exports.createMessage = async (ctx) => {
  const { id } = ctx.state.user;
  const { parent_id, receiver_id, content } = ctx.request.body;

  if (parent_id === undefined) {
    await database('message')
      .insert({
        sender_id: id,
        receiver_id: receiver_id,
        content: content,
      })
      .then((result) => {
        ctx.response.status = 200;
        ctx.body = result;
      });
  } else {
    await database('message')
      .insert({
        parent_id: parent_id,
        sender_id: id,
        receiver_id: receiver_id,
        content: content,
      })
      .then((result) => {
        ctx.response.status = 200;
        ctx.body = result;
      });
  }
};

// 쪽지 전체삭제
exports.deleteAllMessage = async (ctx) => {
  // const { id } = ctx.state.user;

  // await database('message')
  //   .where('receiver_id', id)
  //   .update('receiver_deleted', 1)
  //   .then((result) => {
  //     ctx.response.status = 200;
  //     ctx.body = result;
  //   });

  ctx.response.status = 404;
};
