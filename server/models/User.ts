import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  firstname: {type: String, required: true},
  lastname: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true},
  role: {type: String, required: true},
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Badge" }],
  rewards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reward" }],
  active: { type: Boolean, default: true }
})

export const User = mongoose.model('User', userSchema)
