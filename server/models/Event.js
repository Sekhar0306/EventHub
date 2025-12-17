const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Technology', 'Business', 'Arts', 'Sports', 'Education', 'Food & Drink', 'Music', 'Networking', 'Other'],
    default: 'Other',
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for efficient queries
eventSchema.index({ date: 1 });
eventSchema.index({ creator: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Event', eventSchema);

