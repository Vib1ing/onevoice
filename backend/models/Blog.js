const mongoose = require('mongoose');
const { Schema } = mongoose;

const BlogSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String },
  author: { type: String },
  published: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', BlogSchema);
