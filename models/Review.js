const mongoose = require("mongoose");
const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide review title"],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "Please provide review text"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);
//if we want to set multiple field to be unique then we have to add index field saperately
//i.e. we want single review on a product by a user
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// static function i.e. schema/class methods
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  //setting the aggregate functionality to find averageRating and count

  const result = await this.aggregate([
    { $match: { product: productId } }, //filter reviews with same product id
    {
      $group: {
        //to group by _id
        _id: null, //null as we already match with productId it remain same , so if we pass productId it has same effect
        averageRating: { $avg: "$rating" }, //fields we want after grouping
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    //accessing current Product model and updating values
    await this.model("Product").findByIdAndUpdate(productId, {
      //coalesing i.e it is optional chaining i.e. result[0].averageRating gives undefined or null it returns 0
      averageRating: Math.ceil(result[0]?.averageRating || 0),
      numOfReviews: result[0]?.numOfReviews || 0,
    });
  } catch (error) {
    console.log(error);
  }
};

//to access class methods we use this.constructor
ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});
ReviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
});
module.exports = mongoose.model("Review", ReviewSchema);
