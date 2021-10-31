require('dotenv').config();

const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const database = require('../../database');

const getWisAuth = require('../../lib/getWisAuth');

// 회원가입
exports.register = async (ctx) => {
  const { username, password, nickname } = ctx.request.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await database('user')
      .insert({
        username: username,
        password: hashedPassword,
        nickname: nickname,
      })
      .then((username) => {
        ctx.response.status = 200;
        ctx.body = { result: 'Success', id: username[0] };
      });
  } catch (error) {
    // 아이디 중복 체크
    if (error.code == 'ER_DUP_ENTRY') {
      ctx.response.status = 401;
      ctx.body = {
        result: '이미 사용중인 아이디나 닉네임 입니다. 다시 입력해주세요.',
      };
    }
  }
};

exports.authorizaiton = async (ctx) => {
  const { id } = ctx.state.user;
  const { wis_id, wis_password } = ctx.request.body;

  const result = await getWisAuth(wis_id, wis_password);

  const campusRegex = result[0].match(/\[(.*?)\]/);
  const campusName = campusRegex[1];

  const major = result[1];
  const classOf = result[2].substring(2, 4);
  const studentId = result[2];

  try {
    await database('user')
      .where('id', id)
      .update({
        major: major,
        campus: campusName,
        class_of: classOf,
        student_id: studentId,
        authorized: 1,
      })
      .then(() => {
        ctx.response.status = 200;
        ctx.body = 'success';
      });
  } catch (error) {
    if (error.code == 'ER_DUP_ENTRY') {
      ctx.response.status = 401;
      ctx.body = 'student_id_duplicate';
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
  const { username, password } = ctx.request.body;

  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required(),
  });

  const value = await schema.validateAsync({
    username: username,
    password: password,
  });

  await database('user')
    .where({
      username: value.username,
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
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                created: user.created,
                major: user.major,
                campus: user.campus,
                class_of: user.class_of,
                authorized: user.authorized,
              };

              const options = {
                expiresIn: '7d',
                issuer: 'hufsday',
                subject: 'userInfo',
              };

              const token = jwt.sign(payload, process.env.SECRET_KEY, options);

              ctx.response.status = 200;
              ctx.cookies.set('access_token', token, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
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
