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

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`APP listen to port ${PORT}`);
});