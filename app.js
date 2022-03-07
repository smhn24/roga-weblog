const path = require('path');

const debug = require('debug')('weblog-project');
const express = require('express');
const expressLayout = require('express-ejs-layouts');
const dotEnv = require('dotenv');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const winston = require('./config/winston');

//* Load Config
dotEnv.config({ path: './config/config.env' });

//* Database conncection
connectDB();
debug('Connected to database');

//* Passport Configuration
require('./config/passport');

const app = express();

//* Logging
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev', { stream: winston.stream }));
	debug('Morgan enabled');
}

//* View Engine
app.use(expressLayout);
app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('layout', './layouts/mainLayout');

//* Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
