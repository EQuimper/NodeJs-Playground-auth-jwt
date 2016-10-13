const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

// set up the mongoose model

const UserSchema = new Schema({
	name: {
		type: String,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	}
});

UserSchema.pre('save', next => {
	const user = this;
	if (this.isModified('password') || this.isNew) {
		bcrypt.genSalt(10, (err, salt) => {
			if (err) {
				return next(err);
			}
			bcrypt.hash(user.password, salt, (err, hash) => {
				if (err) {
					return next(err);
				}
				user.password = hash;
				next();
			});
		});
	} else {
		return next();
	}
});

UserSchema.methods.comparePassword = (passw, cb) => {
	bcrypt.compare(passw, this.password, (err, isMatch) => {
		if (err) {
			return cb(err);
		}
		cb(null, isMatch);
	});
};

module.exports = mongoose.model('User', UserSchema);