const path = require('path');

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const dotEnv = require('dotenv');
const morgan = require('morgan');

const connectDB = require('./config/db');
const blogRoutes = require('./routes/blog');
const dashboardRoutes = require('./routes/dashboard');

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

//* Static folder
app.use(express.static(path.join(__dirname, 'public')));

//* Routes
app.use(blogRoutes);
app.use('/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
	console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`),
);
