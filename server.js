require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
if (process.env.NODE_ENV === 'production') {
  // In production, only allow same-origin requests
  app.use(cors({
    origin: process.env.CLIENT_URL || 'https://foodcartfinder.onrender.com'
  }));
} else {
  // In development, allow all origins
  app.use(cors());
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Log current directory and environment
console.log('Current directory:', __dirname);
console.log('Environment:', process.env.NODE_ENV);
console.log('Node version:', process.version);

// Define build path
const buildPath = path.join(__dirname, 'client/build');
console.log('Build path:', buildPath);

// Check if build directory exists
if (fs.existsSync(buildPath)) {
  console.log('Build directory found at:', buildPath);
  console.log('Build directory contents:', fs.readdirSync(buildPath));
} else {
  console.error('Build directory not found at:', buildPath);
  console.error('Current directory contents:', fs.readdirSync(__dirname));
  console.error('Parent directory contents:', fs.readdirSync(path.join(__dirname, '..')));
}

// API routes - define these before the static file middleware
app.use('/api/foodcarts', require('./routes/foodcarts'));
app.use('/api/cartpods', require('./routes/cartpods'));
app.use('/api/upload', require('./routes/upload'));

// Add API route logging
app.use('/api', (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Serve static files from the React app
if (fs.existsSync(buildPath)) {
  console.log('Serving static files from:', buildPath);
  app.use(express.static(buildPath));

  // Handle React routing
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }

    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error(`index.html not found at ${indexPath}`);
      res.status(404).send('Build files not found');
    }
  });
} else {
  console.error('Cannot serve static files - build directory not found');
  app.get('*', (req, res) => {
    res.status(500).send('Build files not found. Please check the server logs.');
  });
}

// Connect to MongoDB
const uri = process.env.MONGODB_URI;
if (uri) {
  mongoose.connect(uri)
    .then(() => console.log('MongoDB connection established successfully'))
    .catch(err => {
      console.log('Error connecting to MongoDB:', err);
      console.log('Starting server without database connection. API endpoints will not work.');
    });
} else {
  console.log('MONGODB_URI not set. Starting server without database connection.');
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Current directory:', __dirname);
  console.log('Build path:', buildPath);
  if (fs.existsSync(buildPath)) {
    console.log('Build directory exists');
    console.log('Build directory contents:', fs.readdirSync(buildPath));
  } else {
    console.log('Build directory does not exist');
    console.log('Current directory contents:', fs.readdirSync(__dirname));
    console.log('Parent directory contents:', fs.readdirSync(path.join(__dirname, '..')));
  }
});  