const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const Author = require('../models/author')
const Book = require('../models/book')

const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
const uploadPath = path.join('public', Book.coverImageBasePath)
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})

router.get('/', async (req, res) => {
  let query = Book.find()
  
  if (req.query.title !== null && req.query.title !== null) {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  
  if (req.query.publishedBefore !== null && req.query.publishedBefore !== '') {
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  
  if (req.query.publishedAfter !== null && req.query.publishedAfter !== '') {
    query = query.gte('publishDate', req.query.publishedAfter)
  }
  
  try {
    const books = await query.exec()
    res.render('books/index', {
      books,
      searchOptions: req.query
    })
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})

router.get('/new', async (req, res) => {
  renderNewPage(res, new Book())
})

router.post('/', upload.single('cover'), async (req, res) => {
  const coverImageName = req.file != null ? req.file.filename : null
  const { title, author, publishDate, pageCount, description } = req.body;
  const book = new Book({
    title,
    author,
    publishDate: new Date(publishDate),
    pageCount,
    coverImageName,
    description
  })
  
  try {
    const newBook = await book.save()
    res.redirect('books')
  } catch (error) {
    console.log(error)
    
    if (book.coverImageName !== null) {
      removeBookCover(book.coverImageName)
    }
    
    renderNewPage(res, book, true)
  }
})

function removeBookCover(filename) {
  fs.unlink(path.join(uploadPath, filename), err => console.error(err))
}

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find()
    const params = {
      authors,
      book
    }
    
    if (hasError) {
      params.errorMessage = 'Error Creating Book.'
    }
    
    res.render('books/new', params)
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
}

module.exports = router