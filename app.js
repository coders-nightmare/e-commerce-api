require("dotenv").config();
require("express-async-errors");

//express
const express = require("express");
const app = express();

//router
const authRouter = require("./routes/authRoutes");

//db
const connectDB = require("./db/connect");

// logs
const morgan = require("morgan");

//middleware
const notFoundMiddleware = require("./middleware/not-found.js");
const errorHandlerMiddleware = require("./middleware/error-handler.js");

// for logs
app.use(morgan("tiny"));
// for req.body
app.use(express.json());

//routes
app.get("/", (req, res) => {
  res.send("<h1>Ecommerce Website</h1>");
});
app.use("/api/v1/auth", authRouter);
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
