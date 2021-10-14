require('dotenv').config();

const bcrypt = require('bcrypt');
const joi = require('joi');
const jwt = require('jsonwebtoken');

const database = require('../../database');

// 회원가입
exports.register = async (ctx) => {
  const { user_id, password, nickname } = ctx.request.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await database('user')
      .insert({
        user_id: user_id,
        password: hashedPassword,
        nickname: nickname,
      })
      .then((user_id) => {
        ctx.response.status = 200;
        ctx.body = { result: 'Success', id: user_id[0] };
      });
  } catch (error) {
    console.log(error); // 1062
    // 아이디 중복 체크
    if (error.code == 'ER_DUP_ENTRY') {
      ctx.response.status = 401;
      ctx.body = {
        result: '이미 사용중인 아이디나 닉네임 입니다. 다시 입력해주세요.',
      };
    }
  }
};

// 로그인 확인
exports.check = (ctx) => {
  const { user } = ctx.state;

  if (!user) {
    ctx.status = 403; // Forbidden
    return;
  }

  ctx.body = user;
};

// 로그인
exports.login = async (ctx) => {
  const { user_id, password } = ctx.request.body;

  await database('user')
    .where({
      user_id: user_id,
    })
    .first()
    .then((user) => {
      if (!user) {
        ctx.response.status = 401;
        ctx.body = { result: '아이디 또는 비밀번호를 다시 확인해주세요.' };
      } else {
        return bcrypt
          .compare(password, user.password)
          .then((isAuthenticated) => {
            if (!isAuthenticated) {
              ctx.response.status = 401;
              ctx.body = {
                result: '아이디 또는 비밀번호를 다시 확인해주세요.',
              };
            } else {
              const payload = {
                user_id: user.user_id,
                nickname: user.nickname,
              };
              const options = {
                expiresIn: '12h',
                issuer: 'hufsday',
                subject: 'userInfo',
              };
              const token = jwt.sign(payload, process.env.SECRET_KEY, options);

              ctx.response.status = 200;
              ctx.cookies.set('access_token', token, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 7,
              });
            }
          });
      }
    });
};

// 로그아웃
exports.logout = async (ctx) => {
  ctx.cookies.set('access_token');
  ctx.status = 204; // No Content
};
