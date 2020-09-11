const mongoose = require('mongoose')
const Book = require('./book')

const AuthorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

AuthorSchema.pre('remove', async function(next) {
  try {
    const books = await Book.find({ author: this.id })
    
    if (books.length > 0) {
      next(new Error('This author has book still'))
    }
    
    next()
  } catch (error) {
    console.log(error)
    next(error)
  }
})

module.exports = mongoose.model('Author', AuthorSchema)