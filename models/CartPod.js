const mongoose = require('mongoose');

const cartPodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  foodCarts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodCart'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
cartPodSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('CartPod', cartPodSchema); 