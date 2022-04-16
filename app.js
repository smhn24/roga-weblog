const path = require('path')

const fileUpload = require('express-fileupload')
const express = require('express')
const nunjucks = require('nunjucks')
const dotEnv = require('dotenv')
const morgan = require('morgan')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const MongoStore = require('connect-mongo')(session)
const mongoose = require('mongoose')

const connectDB = require('./config/db')
const winston = require('./config/winston')

//* Load env variables
dotEnv.config({ path: './config/config.env' })

//* Database conncection
connectDB()

//* Passport Configuration
require('./config/passport')

//* Initialize app
const app = express()

//* Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev', { stream: winston.stream }))
}

//* View Engine
nunjucks.configure('views', {
  autoescape: true,
  express: app,
  watch: true
})
app.set('view engine', 'njk')

//* Body Parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//* File Upload middleware
app.use(fileUpload())

//* Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    unset: 'destroy',
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
)

//* Passport
app.use(passport.initialize())
app.use(passport.session())

//* Flash
app.use(flash()) // available on req.flash

//* Static folder
app.use(express.static(path.join(__dirname, 'public')))

//* Routes
app.use('/', require('./routes/blog'))
app.use('/users', require('./routes/users'))
app.use('/dashboard', require('./routes/dashboard'))

//* 404 Page
app.use(require('./controllers/errorController').get404)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))
