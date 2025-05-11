const { gql } = require('apollo-server');

const typeDefs = gql`

scalar Date

  type User {
    id: ID!
    name: String!
    email: String!
  }

  
    
  type Customer {
    _id: ID!
    name: String!
    email: String!
    age: Int!
    location: String!
    gender: String!
  }
  type getCustomerSpending {
    customerId: ID!
    totalSpent: Float!
    averageOrderValue: Float!
    lastOrderDate: Date
  }
  type getTopSellingProducts {
    productId: ID!
    name: String!
    totalQuantitySold: Int!
    totalRevenue: Float!
  }

  type breakDown{
  category: String!
  revenue: Float!
  }


  type getSalesAnalytics {
    completedOrders: Int!
    totalRevenue: Float!
    categoryBreakdown:[breakDown!]!
  }

type Product {
    id: ID!
    name: String!
    category: String!
    price: Float!
    stock: Int!
  }

type ProductItem {
  productId: Product!
  quantity: Int!
  priceAtPurchase: Float!
}


type Product {
  id: ID!
  name: String
  price: Float
}

  type Query {
    users: [User]
    customers: [Customer]
    customerById(id: ID!): Customer
    products: [Product]
    product(id: ID!): Product
    getOrder(id: ID!): Order
    getAllOrders: [Order!]!
    getCustomerSpending(id: ID!): [getCustomerSpending!]!
    getTopSellingProducts(limit: Int!): [getTopSellingProducts!]!
    getSalesAnalytics: [getSalesAnalytics!]!
  }

  type Mutation {
    createUser(name: String!, email: String!): User
    addCustomer(
      name: String!
      email: String!
      age: Int!
      location: String!
      gender: String!
    ): Customer

  createOrder(customerId: ID!, products: [OrderProductInput!]!): Order
  updateOrder(id: ID!, status: String): Order
  }


  input OrderProductInput {
  productId: ID!
  quantity: Int!
}

type Order {
  id: ID!
  customerId: Customer!
  products: [ProductItem!]!
  totalAmount: Float!
  status: String!
  createdAt: Date
  updatedAt: Date
}

type OrderProduct {
  product: Product!
  quantity: Int
  price: Float
}

`;



// const typeDefs = gql`
//   type Customer {
//     _id: ID!
//     name: String!
//     email: String!
//     age: Int!
//     location: String!
//     gender: String!
//   }

//   type Query {
//     customers: [Customer]
//     customerById(id: ID!): Customer
//   }

//   type Mutation {
//     addCustomer(
//       _id: ID!
//       name: String!
//       email: String!
//       age: Int!
//       location: String!
//       gender: String!
//     ): Customer
//   }
// `;





module.exports = typeDefs;
