const path = require('path');

const express = require('express');
const dotEnv = require('dotenv');

const indexRoutes = require('./routes');

//* Load Config
dotEnv.config({ path: './config/config.env' });

const app = express();

//* View Engine
app.set('view engine', 'ejs');
app.set('views', 'views');

//* Static folder
app.use(express.static(path.join(__dirname, 'public')));

//* Routes
app.use(indexRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
	console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`),
);
