const path = require('path');

const express = require('express');

const indexRoutes = require('./routes');

const app = express();

//* View Engine
app.set('view engine', 'ejs');
app.set('views', 'views');

//* Static folder
app.use(express.static(path.join(__dirname, 'public')));

//* Routes
app.use(indexRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));
