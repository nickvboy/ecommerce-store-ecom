# Product Dashboard

A modern product management dashboard built with Vite and vanilla JavaScript.

## Features

- View all products in a responsive table
- Add new products with a form
- Edit existing products
- Delete products
- Modern UI with smooth interactions
- Hot Module Replacement (HMR) during development
- Production-ready build setup

## Development Setup

1. Make sure the backend API is running on port 5000
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:3001 in your browser

The development server includes:
- Hot Module Replacement (HMR)
- Error overlay
- API proxy configuration

## Production Build

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## API Integration

The dashboard connects to the following API endpoints:

- GET /api/products - List all products
- POST /api/products - Create a new product
- PUT /api/products/:id - Update a product
- DELETE /api/products/:id - Delete a product

The development server automatically proxies API requests to the backend running on port 5000. 