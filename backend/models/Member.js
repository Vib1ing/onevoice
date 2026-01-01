const mongoose = require('mongoose');
const { Schema } = mongoose;

const MemberSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  role: { type: String, default: 'member' },
  bio: { type: String },
  joined: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Member', MemberSchema);
