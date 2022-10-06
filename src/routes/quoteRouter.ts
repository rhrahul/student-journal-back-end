/**
 * @swagger
 *  tags:
 *    name: Quote
 *    description: Quote management
 */
import express, { Request, Response } from "express";
import Quote from "../entities/quote.entity";
import dataSource from "../dataSource";
import { FindOneOptions } from "typeorm";

const { StatusCodes } = require("http-status-codes");

const { body, param } = require("express-validator");
const {
  validateInputs,
  isValidQuoteById,
} = require("../middlewares/validation");

const router = express.Router();

/**
 * @swagger
 *  components:
 *   schemas:
 *    Quote:
 *      type: object
 *      required:
 *        - quote
 *        - author
 *      properties:
 *        id:
 *          type: string
 *          description: The auto-generated id of the quote
 *        quote:
 *          type: string
 *          description: Quote
 *        author:
 *          type: string
 *          description: Author
 *        created_at:
 *          type: string
 *          description: Created At
 *      example:
 *        id: "633d3ec1b102a14e95545190"
 *        quote: "The best way to predict the future is to invent it."
 *        author: "Alan Kay"
 *        created_at: "2021-05-01T00:00:00.000Z"
 */

/**
 * @swagger
 * /quote:
 *  post:
 *    summary: Create a new quote
 *    tags: [Quote]
 *    requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/Quote'
 *    responses:
 *      '200':
 *        description: Quote Created
 */
// add new quote
router.post(
  "/",
  [
    body("quote").exists().trim().withMessage("Quote is required"),
    body("author").exists().trim().withMessage("Author is required"),
  ],
  validateInputs,
  async (req: Request, res: Response) => {
    const quote = new Quote();
    quote.quote = req.body.quote;
    quote.author = req.body.author;

    dataSource
      .getRepository(Quote)
      ?.save(quote)
      .then((quotes) => {
        res.status(StatusCodes.OK).json(quotes);
      })
      .catch((err) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: err });
      });
  }
);

/**
 * @swagger
 * /quote/{id}:
 *  get:
 *    summary: Get quote by id
 *    tags: [Quote]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: Quote id to get
 *        schema:
 *          type: string
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Quote'
 */
// get quote by id
router.get(
  "/:id",
  [param("id").custom(isValidQuoteById)],
  validateInputs,
  async (req: Request, res: Response) => {
    const id = req.params.id as FindOneOptions<Quote>;
    dataSource
      .getRepository(Quote)
      ?.findOne(id)
      .then((quote) => {
        res.status(StatusCodes.OK).json(quote);
      })
      .catch((err) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: err });
      });
  }
);

export default router;
