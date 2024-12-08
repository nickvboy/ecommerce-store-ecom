const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Review = require('../models/Review');

// Export database
exports.exportDatabase = async () => {
    try {
        // Get users without addresses first to avoid decryption issues
        const users = await User.find().select('-password -addresses');
        
        const data = {
            users,
            products: await Product.find(),
            categories: await Category.find(),
            orders: await Order.find(),
            reviews: await Review.find()
        };

        // Return the data directly without saving to file
        return {
            success: true,
            timestamp: new Date(),
            data
        };
    } catch (error) {
        console.error('Export error:', error);
        throw error;
    }
};

// Import database
exports.importDatabase = async (req, res) => {
    try {
        const { data } = req.body;

        if (!data) {
            return res.status(400).json({
                success: false,
                message: 'No data provided'
            });
        }

        // Clear existing data first
        await Promise.all([
            Category.deleteMany({}),
            Product.deleteMany({}),
            Review.deleteMany({}),
            Order.deleteMany({}),
            User.deleteMany({})
        ]);

        // Import new data in sequence to maintain referential integrity
        if (data.categories?.length) {
            // Strip _id from documents to allow MongoDB to generate new ones
            const categories = data.categories.map(category => {
                const { _id, ...categoryData } = category;
                return categoryData;
            });
            await Category.insertMany(categories);
        }

        if (data.products?.length) {
            const products = data.products.map(product => {
                const { _id, ...productData } = product;
                return productData;
            });
            await Product.insertMany(products);
        }

        if (data.reviews?.length) {
            const reviews = data.reviews.map(review => {
                const { _id, ...reviewData } = review;
                return reviewData;
            });
            await Review.insertMany(reviews);
        }

        if (data.orders?.length) {
            const orders = data.orders.map(order => {
                const { _id, ...orderData } = order;
                return orderData;
            });
            await Order.insertMany(orders);
        }

        if (data.users?.length) {
            const users = data.users.map(user => {
                const { _id, ...userData } = user;
                return {
                    ...userData,
                    password: 'defaultPassword123!' // This will be hashed by the User model's pre-save middleware
                };
            });
            await User.insertMany(users);
        }

        res.json({
            success: true,
            message: 'Database imported successfully'
        });
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to import database',
            error: error.message
        });
    }
};