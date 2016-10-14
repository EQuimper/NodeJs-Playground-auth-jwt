const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

// Get user
const User = require('../app/model/user');
// For get the secret
const config = require('../config/database');

module.exports = passport => {
	let opts = {};
	opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
	opts.secretOrKey = config.secret;

	passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
		User.find({ id: jwt_payload.id }, (err, user) => {
			if (err) {
				return done(err, false);
			}

			if (user) {
				done(null, user);
			} else {
				done(null, false)
			}
		});
	}));
};