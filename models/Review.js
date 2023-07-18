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
  console.log(productId);
};

ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});
ReviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
});
module.exports = mongoose.model("Review", ReviewSchema);
