const Review = require("../models/Review");
const Product = require("../models/Product");

const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");

const createReview = async (req, res) => {
  const { product: productId } = req.body;
  const isValidProduct = await Product.findById(productId);
  if (!isValidProduct)
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      "Already submitted review for this product."
    );
  }
  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};
const getAllReview = async (req, res) => {
  //instead of id we can show details using populate method
  const reviews = await Review.find()
    .populate({
      path: "product",
      select: "name company price",
    })
    .populate({
      path: "user",
      select: "name",
    });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
const getSingleReview = async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${id}`);
  }
  res.status(StatusCodes.OK).json({ review });
};
const updateReview = async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${id}`);
  }

  checkPermissions(req.user, review.user);
  const { rating, title, comment } = req.body;
  review.rating = rating;
  review.title = title;
  review.comment = comment;
  await review.save();
  res.status(StatusCodes.OK).json({ review });
};
const deleteReview = async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${id}`);
  }
  checkPermissions(req.user, review.user);

  await review.remove();
  res.status(StatusCodes.OK).json({ msg: "Success! Review Removed" });
};

// to query reviews for a product as virtual doesn't allow we add saperate function
const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
  createReview,
  getAllReview,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
