const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://wishlist-quasar-api.herokuapp.com/auth/google/callback"
  },
  function (accessToken, refreshToken, profile, done) {
    done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

module.exports = {
  passport: passport,
  check: expressJwt({ secret: process.env.JWT_SECRET }),
  google_login: passport.authenticate('google', { scope: ['profile'] }),
  google_callback: passport.authenticate('google', { failureRedirect: 'https://wishlist-quasar.netlify.com' }),
  generateToken(user) {
    return jwt.sign(user, process.env.JWT_SECRET);
  }
}