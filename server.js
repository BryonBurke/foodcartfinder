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
  const buildPath = path.join(__dirname, 'client/build');
  console.log('Looking for build directory at:', buildPath);

  if (fs.existsSync(buildPath)) {
    console.log('Build directory found. Contents:', fs.readdirSync(buildPath));
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
    console.error('Build directory not found at:', buildPath);
    console.error('Current directory contents:', fs.readdirSync(__dirname));
    console.error('Client directory exists:', fs.existsSync(path.join(__dirname, 'client')));
    if (fs.existsSync(path.join(__dirname, 'client'))) {
      console.error('Client directory contents:', fs.readdirSync(path.join(__dirname, 'client')));
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