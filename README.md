# E-Commerce Platform

A modern, full-stack e-commerce platform built with React and Node.js.

## Features

- 🛍️ **Product Management**
  - Browse products with infinite scrolling
  - Advanced filtering by categories, price range, and attributes
  - Detailed product views with images and specifications
  - Product reviews and ratings

- 🔍 **Search & Filter**
  - Dynamic category filtering
  - Price range slider
  - Attribute-based filtering
  - Real-time search results

- 👤 **User Management**
  - User registration and authentication
  - JWT-based secure sessions
  - User profiles with order history
  - Wishlist functionality

- 🛒 **Shopping Experience**
  - Shopping cart management
  - Secure checkout process
  - Order tracking
  - Multiple payment methods support

## Tech Stack

### Frontend
- React.js
- TailwindCSS for styling
- React Router for navigation
- Context API for state management
- Axios for API requests

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- CORS enabled
- RESTful API architecture

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd ecommerce-store
```

2. Install dependencies for both frontend and backend:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

3. Configure environment variables:

Create `.env` file in the root directory:
```env
HOST=0.0.0.0
DANGEROUSLY_DISABLE_HOST_CHECK=true
```

Create `.env` file in the backend directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

4. Start the development servers:
```bash
# From the root directory
npm run dev
```

### Running with Playit.gg (Remote Access)

1. Download and install playit.gg from https://playit.gg/download
2. Run playit.exe
3. Create two tunnels:
   - Frontend: Port 3000
   - Backend: Port 5000
4. Start the application:
```bash
npm run playit
```

## API Documentation

### Products API

- `GET /api/products` - Get all products
- `POST /api/products/filter` - Filter products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories API

- `GET /api/categories` - Get all categories
- `GET /api/categories/tree` - Get category tree
- `GET /api/categories/:id` - Get category details
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Users API

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/wishlist` - Add to wishlist
- `DELETE /api/users/wishlist/:productId` - Remove from wishlist

### Orders API

- `POST /api/orders` - Create order
- `GET /api/orders/:orderId` - Get order details
- `GET /api/orders/email/:email` - Get orders by email
- `PATCH /api/orders/:orderId/status` - Update order status

## Project Structure

```
ecommerce-store/
├── src/                    # Frontend source code
│   ├── components/        # React components
│   ├── contexts/         # Context providers
│   ├── lib/             # Utilities and helpers
│   └── pages/           # Page components
├── backend/              # Backend source code
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   └── utils/           # Utility functions
└── public/              # Static files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React and Node.js
- Styled with TailwindCSS
- Database powered by MongoDB
- Remote access enabled by playit.gg
