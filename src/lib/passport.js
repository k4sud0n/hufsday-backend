require('dotenv').config();

const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY,
  issuer: 'hufsday',
  audience: 'hufsday.com',
};

const verifyUser = async (jwt_payload, done) => {
  try {
    const user = await prisma.user({ id: jwt_payload.id });
    if (user !== null) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
};

passport.use(new Strategy(jwtOptions, verifyUser));
