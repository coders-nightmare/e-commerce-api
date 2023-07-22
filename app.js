require("dotenv").config();
require("express-async-errors");

//express
const express = require("express");
const app = express();

//router
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/orderRoutes");

//db
const connectDB = require("./db/connect");

// logs
const morgan = require("morgan");

//cookie access
const cookieParser = require("cookie-parser");

//file uploads
const fileUpload = require("express-fileupload");

//securtiy
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

//middleware
const notFoundMiddleware = require("./middleware/not-found.js");
const errorHandlerMiddleware = require("./middleware/error-handler.js");

//rate limiter
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);

//other security
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

// // for logs
// app.use(morgan("tiny"));
// for req.body
app.use(express.json());
// for cookie (if argument means signing our cookies)
app.use(cookieParser(process.env.JWT_SECRET));
//static files
app.use(express.static("./public"));
//uploading file
app.use(fileUpload());

//routes

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = 5000 || process.env.PORT;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    // console.log(process.env);
    app.listen(port, console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
