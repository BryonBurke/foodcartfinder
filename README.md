# Food Cart Finder

A web application that helps users find and manage food carts in their area. Built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- User authentication and authorization
- Food cart and cart pod management
- Image upload functionality using Cloudinary
- Interactive map interface
- Search and filter capabilities
- Responsive design

## Tech Stack

- Frontend: React.js, Material-UI
- Backend: Node.js, Express.js
- Database: MongoDB
- Cloud Storage: Cloudinary
- Maps: Google Maps API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account
- Google Maps API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/foodcartfinder.git
cd foodcartfinder
```

2. Install dependencies:
```bash
npm install
cd client
npm install
cd ..
```

3. Create a .env file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Start the development server:
```bash
# Start backend server
npm run dev

# In a new terminal, start frontend
cd client
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 