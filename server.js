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

// Function to check if directory exists
const directoryExists = (path) => {
  try {
    return fs.statSync(path).isDirectory();
  } catch (err) {
    return false;
  }
}

// Function to log directory contents
const logDirectoryContents = (dirPath) => {
  try {
    console.log(`Contents of ${dirPath}:`);
    const contents = fs.readdirSync(dirPath);
    console.log(contents);
    return contents;
  } catch (err) {
    console.log(`Error reading directory ${dirPath}:`, err);
    return [];
  }
}

// Check possible build paths
const possibleBuildPaths = [
  path.join(__dirname, 'client/build'),
  path.join(__dirname, '../client/build'),
  '/opt/render/project/src/client/build',
  path.join(__dirname, '../src/client/build')
];

let buildPath = null;

// Find the first valid build path
for (const path of possibleBuildPaths) {
  console.log(`Checking build path: ${path}`);
  if (directoryExists(path)) {
    buildPath = path;
    console.log(`Found valid build path: ${path}`);
    logDirectoryContents(path);
    break;
  } else {
    console.log(`Build directory not found at: ${path}`);
    // Log parent directory contents
    const parentDir = path.split('/').slice(0, -1).join('/');
    if (directoryExists(parentDir)) {
      console.log(`Checking parent directory: ${parentDir}`);
      logDirectoryContents(parentDir);
    }
  }
}

if (!buildPath) {
  console.error('No valid build path found. Current directory contents:');
  logDirectoryContents(__dirname);
}

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

// Serve static files from React app
if (process.env.NODE_ENV === 'production' && buildPath) {
  console.log('Serving static files from:', buildPath);
  app.use(express.static(buildPath));

  // Handle React routing
  app.get('*', (req, res) => {
    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error(`index.html not found at ${indexPath}`);
      res.status(404).send('Build files not found');
    }
  });
}

// Connect to MongoDB
const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log('MongoDB connection established successfully'))
  .catch(err => {
    console.log('Error connecting to MongoDB:', err);
    console.log('Starting server without database connection. API endpoints will not work.');
  });

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  console.log('Current directory:', __dirname);
  console.log('Environment:', process.env.NODE_ENV);
}); 