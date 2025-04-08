const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const FoodCart = require('../models/FoodCart');
const CartPod = require('../models/CartPod');
const auth = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Get all food carts
router.get('/', async (req, res) => {
  try {
    const foodCarts = await FoodCart.find().populate('cartPod');
    res.json(foodCarts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get food cart by ID
router.get('/:id', async (req, res) => {
  try {
    const foodCart = await FoodCart.findById(req.params.id).populate('cartPod');
    if (!foodCart) {
      return res.status(404).json({ error: 'Food cart not found' });
    }
    res.json(foodCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new food cart
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    
    const { name, cartPodId, location, foodServed, image, menuImages, specialsImages } = req.body;
    
    // Validate required fields
    if (!name || !cartPodId || !location || !foodServed) {
      console.error('Missing required fields:', { name, cartPodId, location, foodServed });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate location format
    if (!location.type || !location.coordinates || !Array.isArray(location.coordinates)) {
      console.error('Invalid location format:', location);
      return res.status(400).json({ error: 'Invalid location format' });
    }

    // Validate that at least one image is provided
    if (!image && (!menuImages || menuImages.length === 0) && (!specialsImages || specialsImages.length === 0)) {
      console.error('No images provided');
      return res.status(400).json({ error: 'At least one image is required' });
    }
    
    const foodCart = new FoodCart({
      name,
      cartPod: cartPodId,
      location,
      image: image || null,
      menuImages: menuImages || [],
      specialsImages: specialsImages || [],
      foodServed,
      createdBy: req.user._id
    });

    await foodCart.save();

    // Add food cart to cart pod
    await CartPod.findByIdAndUpdate(cartPodId, {
      $push: { foodCarts: foodCart._id }
    });

    res.status(201).json(foodCart);
  } catch (error) {
    console.error('Error creating food cart:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update food cart
router.patch('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const foodCart = await FoodCart.findById(req.params.id);
    if (!foodCart) {
      return res.status(404).json({ error: 'Food cart not found' });
    }
    
    if (foodCart.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to edit this food cart' });
    }

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'image',
              folder: 'foodcarts',
              format: 'jpg',
              transformation: [
                { width: 800, height: 600, crop: 'fill' },
                { quality: 'auto' }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          uploadStream.end(file.buffer);
        });
      });

      const imageUrls = await Promise.all(uploadPromises);
      foodCart.image = imageUrls[0];
      foodCart.menuImages = imageUrls.slice(1, 6);
      foodCart.specialsImages = imageUrls.slice(6);
    }

    const updates = Object.keys(req.body);
    updates.forEach(update => {
      if (update !== 'images') {
        if (update === 'foodServed') {
          // For foodServed, completely replace the array
          foodCart.foodServed = req.body.foodServed;
        } else {
          foodCart[update] = req.body[update];
        }
      }
    });

    await foodCart.save();
    res.json(foodCart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete food cart
router.delete('/:id', auth, async (req, res) => {
  try {
    const foodCart = await FoodCart.findById(req.params.id);
    if (!foodCart) {
      return res.status(404).json({ error: 'Food cart not found' });
    }
    
    if (foodCart.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this food cart' });
    }

    // Remove food cart from cart pod
    await CartPod.findByIdAndUpdate(foodCart.cartPod, {
      $pull: { foodCarts: foodCart._id }
    });

    // Delete the food cart
    await FoodCart.findByIdAndDelete(req.params.id);
    res.json({ message: 'Food cart deleted' });
  } catch (error) {
    console.error('Error deleting food cart:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add rating and review
router.post('/:id/ratings', auth, async (req, res) => {
  try {
    const foodCart = await FoodCart.findById(req.params.id);
    if (!foodCart) {
      return res.status(404).json({ error: 'Food cart not found' });
    }

    const { rating, review } = req.body;
    foodCart.ratings.push({
      rating,
      review,
      user: req.user._id
    });

    await foodCart.save();
    res.json(foodCart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Search food carts by food type
router.get('/search/:foodType', async (req, res) => {
  try {
    const foodCarts = await FoodCart.find({
      foodServed: { $regex: req.params.foodType, $options: 'i' }
    }).populate('cartPod');
    res.json(foodCarts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 