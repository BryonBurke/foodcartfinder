const cloudinary = require('cloudinary').v2;

// Debug environment variables
console.log('Environment variables before config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : undefined,
  upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
});

// Ensure API key is properly formatted and remove any potential whitespace or special characters
const apiKey = process.env.CLOUDINARY_API_KEY?.toString().trim().replace(/[^0-9]/g, '');

console.log('Formatted API key:', apiKey);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
});

// Verify configuration
console.log('Cloudinary config after setup:', {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key,
  api_secret: cloudinary.config().api_secret ? '***' : undefined,
  upload_preset: cloudinary.config().upload_preset
});

module.exports = cloudinary; 