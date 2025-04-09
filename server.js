require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

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

// Check if build directory exists
if (fs.existsSync(buildPath)) {
  console.log('Build directory found at:', buildPath);
  console.log('Build directory contents:', fs.readdirSync(buildPath));
} else {
  console.error('Build directory not found at:', buildPath);
  console.error('Current directory contents:', fs.readdirSync(__dirname));
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
app.use(express.static(path.join(__dirname, 'client/build')));

// Handle React routing, return all requests to React app
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

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

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  console.log('Build path:', buildPath);
  console.log('API URL:', process.env.REACT_APP_API_URL || '/api');
});  