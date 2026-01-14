const mongoose = require('mongoose');
const { Schema } = mongoose;

const BlogSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String },
  author: { type: String },
  image: { type: String },
  readTime: { type: Number, default: 3 },
  date: { type: Date, default: Date.now },
  published: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 } // Keeping likes in DB for now to avoid breaking existing data, but UI will hide it
});

module.exports = mongoose.model('Blog', BlogSchema);
