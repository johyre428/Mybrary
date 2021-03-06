if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const mehodOverride = require("method-override")

// DB
const mongoose = require('mongoose')
const db = mongoose.connection

// Routes
const indexRoutes = require('./routes/index')
const authorRoutes = require('./routes/authors')
const bookRoutes = require('./routes/books')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')

app.use(expressLayouts)
app.use(mehodOverride('_method'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to DB'))

app.use('/', indexRoutes)
app.use('/authors', authorRoutes)
app.use('/books', bookRoutes)

app.listen(process.env.PORT || 3000)