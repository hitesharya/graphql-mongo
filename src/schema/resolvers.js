const User = require('../models/User');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require('mongoose')

const resolvers = {
    Query: {
        users: async () => await User.find(),
        customers: async () => await Customer.find(),
        customerById: async (_, { id }) => await Customer.findById(id),
        products: async () => await Product.find(),
        product: async (_, { id }) => await Product.findById(id),

        getOrder: async (_, { id }) =>
            await Order.findById(id)
                .populate('customerId')
                .populate('products.productId'),

        getAllOrders: async () =>
            await Order.find()
                .populate('customerId')
                .populate('products.productId'),

        getCustomerSpending: async (_, { id }) => {
            let customerId = new mongoose.Types.ObjectId(id);
            let result = await Order.aggregate([
                { $match: { customerId } },
                {
                    $group: {
                        _id: "$customerId",
                        totalSpent: { $sum: "$totalAmount" },
                        averageOrderValue: { $avg: "$totalAmount" },
                        lastOrderDate: { $max: "$createdAt" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        customerId: "$_id",
                        totalSpent: { $round: ["$totalSpent", 2] },
                        averageOrderValue: { $round: ["$averageOrderValue", 2] },
                        lastOrderDate: 1
                    }
                }
            ]);

            return result
        },

        getTopSellingProducts: async (_, { limit }) => {

            const topSellingProducts = await Order.aggregate([
                { $unwind: "$products" },
                {
                    $group: {
                        _id: "$products.productId",
                        totalQuantitySold: { $sum: "$products.quantity" },
                        totalRevenue: { $sum: { $multiply: ["$products.quantity", "$products.priceAtPurchase"] } }
                    }
                },
                {
                    $lookup: {
                        from: "products", // Make sure this matches your collection name
                        localField: "_id",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                { $unwind: "$product" },
                {
                    $project: {
                        _id: 0,
                        productId: "$_id",
                        name: "$product.name",
                        totalQuantitySold: 1,
                        totalRevenue: { $round: ["$totalRevenue", 2] }
                    }
                },
                { $sort: { totalQuantitySold: -1 } },
                { $limit: limit } // top 10 selling products
            ]);


            return topSellingProducts
        },


        getSalesAnalytics: async () => {

            const analytics = await Order.aggregate([
                { $match: { status: "COMPLETED" } },
                { $unwind: "$products" },
                {
                    $lookup: {
                        from: "products", // Adjust if your collection name is different
                        localField: "products.productId",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                { $unwind: "$product" },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalAmount" },
                        completedOrders: { $sum: 1 },
                        categoryRevenue: {
                            $push: {
                                category: "$product.category",
                                revenue: { $multiply: ["$products.quantity", "$products.priceAtPurchase"] }
                            }
                        }
                    }
                },
                {
                    $unwind: "$categoryRevenue"
                },
                {
                    $group: {
                        _id: "$categoryRevenue.category",
                        revenue: { $sum: "$categoryRevenue.revenue" },
                        totalRevenue: { $first: "$totalRevenue" },
                        completedOrders: { $first: "$completedOrders" }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $first: "$totalRevenue" },
                        completedOrders: { $first: "$completedOrders" },
                        categoryBreakdown: {
                            $push: {
                                category: "$_id",
                                revenue: { $round: ["$revenue", 2] }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalRevenue: { $round: ["$totalRevenue", 2] },
                        completedOrders: 1,
                        categoryBreakdown: 1
                    }
                }
            ]);



            return analytics
        }

    },
    Mutation: {
        createUser: async (_, { name, email }) => {
            const user = new User({ name, email });
            await user.save();
            return user;
        },
        addCustomer: async (_, args) => {
            const customer = new Customer(args);
            await customer.save();
            return customer;
        },

        async createOrder(_, { customerId, products }) {
            const productDetails = await Promise.all(products.map(async (item) => {
                const product = await Product.findById(item.productId);
                return {
                    productId: mongoose.Types.ObjectId(item.productId),
                    quantity: item.quantity,
                    price: product.price,
                };
            }));

            const totalAmount = productDetails.reduce(
                (sum, p) => sum + (p.quantity * p.price), 0
            );

            const newOrder = new Order({
                customerId,
                products: productDetails,
                totalAmount,
                status: 'PENDING',
            });

            return await newOrder.save();
        },

        async updateOrder(_, { id, status }) {
            return await Order.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            ).populate('customerId')
                .populate('products.productId');
        }
        ,




    },
};

module.exports = resolvers;
