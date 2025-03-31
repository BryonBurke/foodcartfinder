const express = require('express');
const router = express.Router();
const CartPod = require('../models/CartPod');
const auth = require('../middleware/auth');

// Get all cart pods
router.get('/', async (req, res) => {
  try {
    const cartPods = await CartPod.find().populate({
      path: 'foodCarts',
      select: 'name image foodServed location'
    });
    res.json(cartPods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cart pod by ID
router.get('/:id', async (req, res) => {
  try {
    const cartPod = await CartPod.findById(req.params.id).populate({
      path: 'foodCarts',
      select: 'name image foodServed location'
    });
    if (!cartPod) {
      return res.status(404).json({ error: 'Cart pod not found' });
    }
    res.json(cartPod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new cart pod
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, location } = req.body;
    const cartPod = new CartPod({
      name,
      description,
      location,
      createdBy: req.user._id
    });
    await cartPod.save();
    res.status(201).json(cartPod);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update cart pod
router.patch('/:id', auth, async (req, res) => {
  try {
    const cartPod = await CartPod.findById(req.params.id);
    if (!cartPod) {
      return res.status(404).json({ error: 'Cart pod not found' });
    }
    
    if (cartPod.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to edit this cart pod' });
    }

    const updates = Object.keys(req.body);
    updates.forEach(update => cartPod[update] = req.body[update]);
    await cartPod.save();
    
    res.json(cartPod);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete cart pod
router.delete('/:id', auth, async (req, res) => {
  try {
    const cartPod = await CartPod.findById(req.params.id);
    if (!cartPod) {
      return res.status(404).json({ error: 'Cart pod not found' });
    }
    
    if (cartPod.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this cart pod' });
    }

    // Delete the cart pod
    await CartPod.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cart pod deleted' });
  } catch (error) {
    console.error('Error deleting cart pod:', error);
    res.status(500).json({ error: error.message });
  }
});

// Find nearest cart pods
router.get('/nearby/:lat/:lng/:maxDistance', async (req, res) => {
  try {
    const { lat, lng, maxDistance } = req.params;
    const cartPods = await CartPod.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance) * 1000 // Convert km to meters
        }
      }
    }).populate('foodCarts');
    
    res.json(cartPods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 