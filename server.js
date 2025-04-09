require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api/foodcarts', require('./routes/foodcarts'));
app.use('/api/cartpods', require('./routes/cartpods'));
app.use('/api/upload', require('./routes/upload'));

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
    app.use(express.static(buildPath));

    app.get('*', (req, res) => {
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodcartfinder', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err)); 