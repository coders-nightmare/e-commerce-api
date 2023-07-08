require("dotenv").config();
require("express-async-errors");

//express
const express = require("express");
const app = express();

//router
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");

//db
const connectDB = require("./db/connect");

// logs
const morgan = require("morgan");

//cookie access
const cookieParser = require("cookie-parser");

//middleware
const notFoundMiddleware = require("./middleware/not-found.js");
const errorHandlerMiddleware = require("./middleware/error-handler.js");

// for logs
app.use(morgan("tiny"));
// for req.body
app.use(express.json());
// for cookie (if argument means signing our cookies)
app.use(cookieParser(process.env.JWT_SECRET));
//static files
app.use(express.static("./public"));

//routes
app.get("/", (req, res) => {
  res.send("<h1>Ecommerce Website</h1>");
});
app.get("/api/v1", (req, res) => {
  console.log(req.signedCookies);
  res.send("<h1>Ecommerce Website</h1>");
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

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
