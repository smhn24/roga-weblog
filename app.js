const path = require('path');

const fileUpload = require('express-fileupload');
const express = require('express');
const expressLayout = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

const connectDB = require('./config/db');

//* Database conncection
connectDB();

//* Passport Configuration
require('./config/passport');

const app = express();

//* View Engine
app.use(expressLayout);
app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('layout', './layouts/mainLayout');

//* Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//* File Upload middleware
app.use(fileUpload());

//* Session
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		store: new MongoStore({
			mongooseConnection: mongoose.connection,
		}),
		unset: 'destroy',
	}),
);

//* Passport
app.use(passport.initialize());
app.use(passport.session());

//* Flash
app.use(flash());

//* Static folder
app.use(express.static(path.join(__dirname, 'public')));

//* Routes
app.use('/', require('./routes/blog'));
app.use('/users', require('./routes/users'));
app.use('/dashboard', require('./routes/dashboard'));

//* 404 Page
app.use(require('./controllers/errorController').get404);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
	console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`),
);
