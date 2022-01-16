const mongoose = require("mongoose");
const Product = require("./product");
const Schema = mongoose.Schema;

const farmSchema = new Schema({
  name: {
    type: String,
    required: [true, "Farm must have a name"],
  },
  city: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Must have an email"],
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

// Mongoose middleware, what to do 'post' deletion
farmSchema.post("findOneAndDelete", async function (farm) {
  if (farm.products.length) {
    const res = await Product.deleteMany({ _id: { $in: farm.products } });
    console.log(res);
  }
});

const Farm = mongoose.model("Farm", farmSchema);

module.exports = Farm;
