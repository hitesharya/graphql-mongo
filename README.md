# graphql-mongo
commands
1.git clone https://github.com/hitesharya/graphql-mongo.git
2. npm install
3. npm run dev
4. run http://localhost:4000
5. run following queries in graphql client on browser in operation section


query {
  getCustomerSpending(id:"645f1a7e81b1b93c1a000001") {
    customerId     
    totalSpent
    averageOrderValue
    lastOrderDate

  },

   getTopSellingProducts(limit:1) {
    productId     
    name
    totalQuantitySold
    totalRevenue

  }


  getSalesAnalytics {
    totalRevenue     
    completedOrders
   categoryBreakdown{
	category
        revenue
}
  }

}




some extra queries also


for customers

query {
  customers {
    _id
    name
    email
    age
    location
    gender
  }
}


for products


query {
  products {
    id
    name
    category
    price
    stock
  }
}



for orders 


query {
getAllOrders  {
    id
    customerId {
      _id
      name
    }
    products {
      productId {
        id
        name
        price
      }
      quantity
    }
    status
    totalAmount

  }
}



query {
  getOrder(id: "64a1f0bc12c3d56a23b0e1c1") {
    id
    customerId {
      _id
      name
    }
    products {
      productId {
        id
        name
        price
      }
      quantity
    }
    status
    totalAmount

  }
}

















