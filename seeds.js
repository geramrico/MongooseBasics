const mongoose = require("mongoose");
const Product = require("./models/product");

mongoose
  .connect("mongodb://localhost:27017/farmStand")
  .then(() => {
    console.log("Mongo connection open");
  })
  .catch((err) => {
    console.log("Something went wrong");
  });

const seedProducts = [
  { name: "tomato", price: 2, category: "vegetable" },
  { name: "cheese", price: 10, category: "dairy" },
  { name: "milk", price: 8, category: "dairy" },
  { name: "avocado", price: 11, category: "vegetable" },
  { name: "strawberry", price: 2.5, category: "fruit" },
  { name: "apple", price: 3, category: "fruit" },
];

Product.insertMany(seedProducts)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    err;
  });
