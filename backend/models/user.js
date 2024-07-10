const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     username: { type: String, unique: true },
//     name: String,
//     location: String,
//     bio: String,
//     public_repos: Number,
//     public_gists: Number,
//     followers: Number,
//     following: Number,
//     created_at: Date,
//     updated_at: { type: Date, default: Date.now },
//   });
  
const userSchema = new mongoose.Schema({
  username: String,
  details: Object,
  friends: [String],
  deleted: { type: Boolean, default: false },
});
  module.exports = mongoose.model('User', userSchema);
  