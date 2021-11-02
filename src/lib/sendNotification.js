const database = require('../database');

const sendNotification = async (
  board,
  post_id,
  sender_id,
  receiver_id,
  content
) => {
  await database('notification').insert({
    board: board,
    post_id: post_id,
    sender_id: sender_id,
    receiver_id: receiver_id,
    content: content,
  });
};

module.exports = sendNotification;
