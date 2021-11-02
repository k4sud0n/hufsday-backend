const database = require('../../database');

// 알림 목록
exports.listNotification = async (ctx) => {
  const { id } = ctx.state.user;

  await database('notification')
    .select(
      'id',
      'sender_id',
      'board',
      'post_id',
      'content',
      'created',
      'readed'
    )
    .where('receiver_id', id)
    .orderBy('id', 'desc')
    .then((result) => {
      ctx.response.status = 200;
      ctx.body = result;
    });
};

// 알림 개수
exports.countNotification = async (ctx) => {
  const { id } = ctx.state.user;

  await database('notification')
    .select('id')
    .where('receiver_id', id)
    .andWhere('readed', 0)
    .then((result) => {
      ctx.response.status = 200;
      ctx.body = result;
    });
};

// 알림 읽음 업데이트
exports.updateNotification = async (ctx) => {
  const { id } = ctx.state.user;
  const { notification_id } = ctx.params;

  await database('notification')
    .where('id', notification_id)
    .andWhere('receiver_id', id)
    .update('readed', 1)
    .then((result) => {
      ctx.response.status = 200;
      ctx.body = result;
    });
};

// 알림 삭제
exports.deleteNotification = async (ctx) => {
  const { id } = ctx.state.user;

  await database('notification')
    .where('receiver_id', id)
    .del()
    .then((result) => {
      ctx.response.status = 200;
      ctx.body = result;
    });
};
