const mongoose = require('mongoose');
const { Schema } = mongoose;

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  location: { type: String }
});

module.exports = mongoose.model('Event', EventSchema);
