//Express imports
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const AppError = require("./AppError");

//Models import
const Product = require("./models/product");
const Farm = require("./models/farm");

const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/farmStand")
  .then(() => {
    console.log("Mongo connection open");
  })
  .catch((err) => {
    console.log("Something went wrong");
  });

//EXPRESS SET UP
//To get the response body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Method override
app.use(methodOverride("_method"));

//Set views path and view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const categories = ["fruit", "vegetable", "dairy"];

//Wrapper for easier try/catch
function WrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((e) => next(e));
  };
}

// FARM ROUTES

app.get("/farms", async (req, res) => {
  const farms = await Farm.find({});
  res.render("farms/index", { farms });
});

// /farms/:id/products/new   - FORM
app.get("/farms/:id/products/new", async (req, res) => {
  const { id } = req.params;
  const farm = await Farm.findById(id);
  res.render("products/new", { categories, farm });
});

// /farms/:id/products   - POST REQUEST
app.post("/farms/:id/products", async (req, res) => {
  const product = new Product(req.body);
  const farm = await Farm.findById(req.params.id);
  farm.products.push(product);
  product.farm = farm;
  await farm.save();
  await product.save();

  res.redirect(`/farms/${req.params.id}`);
});

app.get("/farms/new", (req, res) => {
  res.render("farms/new", { categories });
});

app.delete("/farms/:id", async (req, res) => {
  const farm = await Farm.findByIdAndDelete(req.params.id);
  res.redirect("/farms");
});

app.get("/farms/:id", async (req, res) => {
  const farm = await Farm.findById(req.params.id).populate("products");
  res.render("farms/show", { farm });
});


app.post("/farms", async (req, res) => {
  const newFarm = new Farm(req.body);
  await newFarm.save();
  res.redirect("/farms");
});

// PRODUCT ROUTES

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/products",
  WrapAsync(async (req, res) => {
    const { category } = req.query;
    if (category) {
      const products = await Product.find({ category: category });
      const title = category;
      res.render("products/index", { products, title });
    } else {
      const products = await Product.find({});
      const title = "All";
      res.render("products/index", { products, title });
    }
  })
);

app.post(
  "/products",
  WrapAsync(async (req, res, next) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.redirect(`products/${newProduct._id}`);
  })
);

app.get("/products/new", (req, res) => {
  res.render("products/new", { categories });
});

app.get(
  "/products/:id",
  WrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate("farm");
    if (!product) {
      throw new AppError("Product not found!", 404); //Pass to "new" in when asynchronus
    }
    res.render("products/show", { product });
  })
);

app.get(
  "/products/:id/edit",
  WrapAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new AppError("Product not found!", 404); //Pass to "new" in when asynchronus
    }
    res.render("products/edit", { product, categories });
  })
);

app.put(
  "/products/:id",
  WrapAsync(async (req, res, next) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
    res.redirect(`/products/${product._id}`);
  })
);

app.delete(
  "/products/:id",
  WrapAsync(async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/products");
  })
);

//Error handling

app.use((err, req, res, next) => {
  console.log(err.name);
  next(err);
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong!!" } = err;
  res.status(status).send(message);
});

app.listen(3000, () => {
  console.log("On port 3000!");
});
