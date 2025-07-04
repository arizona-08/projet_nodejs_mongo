import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  role: String
})

export const User = mongoose.model('User', userSchema)
