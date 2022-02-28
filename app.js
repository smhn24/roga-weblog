const path = require('path');

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const dotEnv = require('dotenv');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const connectDB = require('./config/db');

//* Load Config
dotEnv.config({ path: './config/config.env' });

//* Database conncection
connectDB();

const app = express();

//* Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//* View Engine
app.use(expressLayout);
app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('layout', './layouts/mainLayout');

//* Body Parser
app.use(bodyParser.urlencoded({ extended: false }));

//* Static folder
app.use(express.static(path.join(__dirname, 'public')));

//* Routes
app.use('/', require('./routes/blog'));
app.use('/users', require('./routes/users'));
app.use('/dashboard', require('./routes/dashboard'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
	console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`),
);
