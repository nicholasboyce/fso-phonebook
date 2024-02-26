const mongoose = require('mongoose')

const url = `${process.env.MONGODB_URI}`
mongoose.set('strictQuery', false)
mongoose
  .connect(url)
  .then(console.log('Connected to MongoDB!'))
  .catch(error => console.log('error connecting to MongoDB:', error.message))

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      // eslint-disable-next-line no-useless-escape
      validator: (v) => '/\d{2,3}-/\d/'.test(v)
    },
    required: true
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)