import "reflect-metadata";
import express, { Request, Response } from "express";

// Middlewares
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const { StatusCodes } = require("http-status-codes");

// Routes
import entryRouter from "./routes/entryRouter";
import quoteRouter from "./routes/quoteRouter";

const app = express();
const port = process.env.PORT || 3000;

// Swagger
const swaggerOptions = require("./swagger.json");
const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Cors
app.use(cors());

// Apply the rate limiting middleware to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: (req: Request, res: Response) => {
    res
      .status(StatusCodes.TOO_MANY_REQUESTS)
      .json({ message: "You can only make 100 requests every 15 Minutes" });
  },
});
app.use(limiter);

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Student Journal Public API",
    version: "1.0.0",
    author: "Rahul Pipaliya",
    docs: "/api-docs",
  });
});

app.use("/entry", entryRouter);
app.use("/quote", quoteRouter);

app.listen(port, () => {
  console.log(`back-end listening on port ${port}`);
});
