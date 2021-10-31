require('dotenv').config();

const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return new Promise((resolve, reject) => {
    const options = {
      expiresIn: '7d',
      issuer: 'hufsday',
      subject: 'userInfo',
    };

    jwt.sign(payload, process.env.SECRET_KEY, options, (error, token) => {
      if (error) reject(error);
      resolve(token);
    });
  });
};

const decodeToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
      if (error) reject(error);
      resolve(decoded);
    });
  });
};

exports.jwtMiddleware = async (ctx, next) => {
  const token = ctx.cookies.get('access_token'); // ctx 에서 access_token 을 읽어옵니다
  if (!token) return next(); // 토큰이 없으면 바로 다음 작업을 진행합니다.

  try {
    const decoded = await decodeToken(token); // 토큰을 디코딩 합니다

    ctx.state.user = {
      id: decoded.id,
      username: decoded.username,
      nickname: decoded.nickname,
      created: decoded.created,
      major: decoded.major,
      campus: decoded.campus,
      class_of: decoded.class_of,
      authorized: decoded.authorized,
    };

    // 토큰 만료일이 하루밖에 안남으면 토큰을 재발급합니다
    if (Date.now() / 1000 - decoded.iat > 60 * 60 * 24) {
      // 하루가 지나면 갱신해준다.
      const payload = {
        id: decoded.id,
        username: decoded.username,
        nickname: decoded.nickname,
        created: decoded.created,
        major: decoded.major,
        campus: decoded.campus,
        class_of: decoded.class_of,
        authorized: decoded.authorized,
      };

      const freshToken = await generateToken(payload);
      ctx.cookies.set('access_token', freshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
      });
    }
  } catch (e) {
    // token validate 실패
    ctx.request.user = null;
  }

  return next();
};
