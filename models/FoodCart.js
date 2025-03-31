const mongoose = require('mongoose');

const foodCartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  cartPod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CartPod',
    required: true
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
  image: {
    type: String,
    required: true
  },
  menuImages: [{
    type: String
  }],
  specialsImages: [{
    type: String
  }],
  foodServed: [{
    type: String,
    required: true
  }],
  ratings: [{
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
foodCartSchema.index({ location: '2dsphere' });

// Calculate average rating before saving
foodCartSchema.pre('save', function(next) {
  if (this.ratings.length > 0) {
    this.averageRating = this.ratings.reduce((acc, curr) => acc + curr.rating, 0) / this.ratings.length;
  }
  next();
});

module.exports = mongoose.model('FoodCart', foodCartSchema); 