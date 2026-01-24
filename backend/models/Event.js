const mongoose = require('mongoose');
const { Schema } = mongoose;

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String },  // Store as string to avoid timezone issues
  time: { type: String },
  location: { type: String },
  type: { type: String, enum: ['upcoming', 'past'], default: 'upcoming' },
  stats: { type: String },
  image: { type: String }
});

module.exports = mongoose.model('Event', EventSchema);
