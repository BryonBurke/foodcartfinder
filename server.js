require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

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

// API routes - define these before the static file middleware
app.use('/api/foodcarts', require('./routes/foodcarts'));
app.use('/api/cartpods', require('./routes/cartpods'));
app.use('/api/upload', require('./routes/upload'));

// Add API route logging in production
if (process.env.NODE_ENV === 'production') {
  app.use('/api', (req, res, next) => {
    console.log(`API Request: ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Serve static files from the React build directory in production
if (process.env.NODE_ENV === 'production') {
  // Try multiple possible build paths
  const possibleBuildPaths = [
    path.join(__dirname, 'client/build'),           // Local development path
    path.join(__dirname, '../client/build'),        // One level up
    '/opt/render/project/src/client/build',         // Render's path
    path.join(__dirname, '../src/client/build')     // Render's alternative path
  ];

  console.log('Current directory:', __dirname);
  console.log('Checking possible build paths:', possibleBuildPaths);

  // Find the first valid build path
  const buildPath = possibleBuildPaths.find(path => {
    console.log('Checking path:', path);
    return fs.existsSync(path);
  });

  if (buildPath) {
    console.log('Build directory found at:', buildPath);
    console.log('Build directory contents:', fs.readdirSync(buildPath));
    
    // Serve static files
    app.use(express.static(buildPath));

    // This should be the LAST route
    app.get('*', (req, res) => {
      // Don't serve index.html for API routes
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }

      const indexPath = path.join(buildPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error('index.html not found in build directory');
        res.status(404).send('Application files not found');
      }
    });
  } else {
    console.error('Build directory not found in any of the possible locations');
    console.error('Current directory contents:', fs.readdirSync(__dirname));
    if (fs.existsSync(path.join(__dirname, '..'))) {
      console.error('Parent directory contents:', fs.readdirSync(path.join(__dirname, '..')));
    }
    if (fs.existsSync('/opt/render/project/src')) {
      console.error('Render project directory contents:', fs.readdirSync('/opt/render/project/src'));
    }
  }
}

const PORT = process.env.PORT || 5002;

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('NODE_ENV:', process.env.NODE_ENV);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodcartfinder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // 5 second timeout
})
.then(() => {
  console.log('MongoDB Connected Successfully');
  // Start server only after successful database connection
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    code: err.code,
    codeName: err.codeName
  });
  
  // Start server even if database connection fails
  console.log('Starting server despite database connection failure...');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Note: API endpoints requiring database access will not work');
  });
}); 