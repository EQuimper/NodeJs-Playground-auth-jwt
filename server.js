const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const config = require('./config/database');
const User = require('./app/model/user');
const jwt = require('jwt-simple');

const app = express();

// get your request params
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));

// use the passport package in our app
app.use(passport.initialize());

app.get('/', (req, res) => {
	res.send('Hello!');
});

mongoose.connect(config.database);

require('./config/passport')(passport);

const apiRoutes = express.Router();

apiRoutes.post('/signup', (req, res) => {
	if (!req.body.name || !req.body.password) {
		res.json({ success: false, msg: 'Please you need a name and a password'});
	} else {
		const newUser = new User({
			name: req.body.name,
			password: req.body.password
		});

		newUser.save(err => {
			if (err) {
				res.json({ success: false, msg: 'Error'});
			} else {
				res.json({ success: true, msg: 'Successful created user!'});
			}
		});
	}
});

apiRoutes.post('/login', (req, res) => {
	User.findOne({
		name: req.body.name // Cause this is unique
	}, (err, user) => {
		if (err) throw err;

		if (!user) {
			return res.status(403).send({ success: false, msg: 'Authentication failed. User not found!' });
		} else {
			user.comparePassword(req.body.password, (err, isMatch) => {
				if (isMatch && !err) {
					const token = jwt.encode(user, config.secret);

					res.json({ success: true, token: `JWT ${token}` });
				} else {
					return res.status(403).send({ success: false, msg: 'Authentication failed. Wrong Password!' })
				}
			});
		}
	});
});

apiRoutes.get('/member', passport.authenticate('jwt', { session: false }), (req, res) => {
	const token = getToken(req.headers);
	if (token) {
		const decoded = jwt.decode(token, config.secret);
		User.findOne({
			name: decoded.name
		}, (err, user) => {
			if (err) throw err;

			if (!user) {
				return res.status(403).send({ success: false, msg: 'Authentication failed. User not found!' })
			} else {
				return res.json({ success: true, msg: 'Welcome in the member area!'});
			}
		});
	} else {
		return res.status(403).send({ success: false, msg: 'Authentication failed. No Token provided ' + user.name + '!' });
	}
});

getToken = headers => {
	if (headers && headers.authorization) {
		let parted = headers.authorization.split(' ');
		if (parted.length === 2) {
			return parted[1];
		} else {
			return null;
		}
	} else {
		return null;
	}
};

app.use('/api', apiRoutes);

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`APP listen to port ${PORT}`);
});