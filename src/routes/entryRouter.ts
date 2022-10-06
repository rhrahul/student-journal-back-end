/**
 * @swagger
 *  tags:
 *    name: Entry
 *    description: Entry management
 */

import express, { NextFunction, Request, Response } from "express";
import Entry from "../entities/entry.entity";
import Quote from "../entities/quote.entity";

import dataSource from "../dataSource";
import { FindOptionsWhere, FindOneOptions } from "typeorm";
const { StatusCodes } = require("http-status-codes");

const { body, param } = require("express-validator");
const {
  validateInputs,
  isValidEntryById,
  isValidQuoteById,
} = require("../middlewares/validation");

const router = express.Router();

const getQuote = (quoteId: any) => {
  return new Promise((resolve, reject) => {
    dataSource
      .getRepository(Quote)
      ?.findOne(quoteId)
      .then((quote) => {
        resolve(quote);
      })
      .catch((err) => {
        resolve(null);
      });
  });
};

const getQuotesForEntry = async (entries: any) => {
  for (let i = 0; i < entries.length; i++) {
    const quote = await getQuote(entries[i]?.quoteId);
    entries[i].quote = quote;
  }
  return entries;
};

/**
 * @swagger
 *  components:
 *   schemas:
 *    NewEntry:
 *      type: object
 *      required:
 *        - title
 *        - description
 *        - createdBy
 *        - quote
 *        - author
 *      properties:
 *        id:
 *          type: string
 *          description: The auto-generated id of the entry
 *        title:
 *          type: string
 *          description: Title
 *        description:
 *          type: string
 *          description: Description
 *        quoteId:
 *          type: string
 *          description: Quote Id
 *        createdBy:
 *          type: string
 *          description: Created By
 *        updatedBy:
 *          type: string
 *          description: Updated By
 *        created_at:
 *          type: string
 *          description: Created At
 *        updated_at:
 *          type: string
 *          description: Last Updated At
 *      example:
 *        id: "633d3ec1b102a14e95545180"
 *        title: "My First Entry"
 *        description: "This is my first entry"
 *        quoteId: "633d3ec1b102a14e95545190"
 *        created_at: "2021-05-01T00:00:00.000Z"
 *        updated_at: "2021-05-01T00:00:00.000Z"
 *    EntryPatch:
 *      type: object
 *      required:
 *        - updatedBy
 *      properties:
 *        title:
 *          type: string
 *          description: Title
 *        description:
 *          type: string
 *          description: Description
 *        updatedBy:
 *          type: string
 *          description: Updated by
 *    Entry:
 *      type: object
 *      required:
 *        - title
 *        - description
 *        - createdBy
 *      properties:
 *        id:
 *          type: string
 *          description: The auto-generated id of the entry
 *        title:
 *          type: string
 *          description: Title
 *        description:
 *          type: string
 *          description: Description
 *        quoteId:
 *          type: string
 *          description: Quote Id
 *        createdBy:
 *          type: string
 *          description: Created By
 *        updatedBy:
 *          type: string
 *          description: Updated By
 *        created_at:
 *          type: string
 *          description: Created At
 *        updated_at:
 *          type: string
 *          description: Last Updated At
 *      example:
 *        id: "633d3ec1b102a14e95545180"
 *        title: "My First Entry"
 *        description: "This is my first entry"
 *        quoteId: "633d3ec1b102a14e95545190"
 *        created_at: "2021-05-01T00:00:00.000Z"
 *        updated_at: "2021-05-01T00:00:00.000Z"
 */

/**
 * @swagger
 * /entry:
 *  get:
 *   summary: Get all entries
 *   tags: [Entry]
 *   responses:
 *    '200':
 *      description: A successful response
 *    '400':
 *      description: Bad Request
 */
// get all entries
router.get("/", async (req: Request, res: Response) => {
  dataSource
    .getRepository(Entry)
    ?.find({ relations: ["quote"] })
    .then(async (entries) => {
      getQuotesForEntry(entries).then((entries) => {
        res.status(StatusCodes.OK).json(entries);
      });
    })
    .catch((err) => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: err });
    });
});

/**
 * @swagger
 * /entry/{id}:
 *  get:
 *    summary: Get entry by id
 *    tags: [Entry]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: Entry id to get
 *        schema:
 *          type: string
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Entry'
 */
// get entry by id
router.get(
  "/:id",
  [param("id").custom(isValidEntryById)],
  validateInputs,
  async (req: Request, res: Response) => {
    const id = req.params.id as FindOneOptions<Entry>;
    dataSource
      .getRepository(Entry)
      ?.findOne(id)
      .then((entry) => {
        getQuotesForEntry([entry]).then((entries) => {
          res.status(StatusCodes.OK).json(entries[0]);
        });
      })
      .catch((err) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: err });
      });
  }
);

/**
 * @swagger
 * /entry:
 *  post:
 *    summary: Create a new entry
 *    tags: [Entry]
 *    requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/NewEntry'
 *    responses:
 *      '200':
 *        description: Entry Created
 */

// create new entry
router.post(
  "/",
  [
    body("title").exists().trim().withMessage("Title is required"),
    body("description").exists().trim().withMessage("Description is required"),
    body("createdBy").exists().trim().withMessage("Creator name is required"),
    body("quote").exists().trim().withMessage("Quote is required"),
    body("author").exists().trim().withMessage("Author is required"),
  ],
  validateInputs,
  async (req: Request, res: Response) => {
    const quote = new Quote();
    quote.quote = req.body.quote;
    quote.author = req.body.author;

    // First create the quote then create the entry
    dataSource
      .getRepository(Quote)
      ?.save(quote)
      .then((quotes) => {
        const entry = new Entry();
        entry.title = req.body.title;
        entry.description = req.body.description;
        entry.quoteId = quotes.id;
        entry.createdBy = req.body.createdBy;
        entry.updatedBy = req.body.createdBy;

        dataSource
          .getRepository(Entry)
          ?.save(entry)
          .then((entries) => {
            res.status(StatusCodes.OK).json(entries);
          })
          .catch((err) => {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: err });
          });
      })
      .catch((err) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: err });
      });
  }
);

/**
 * @swagger
 * /entry/{id}:
 *  put:
 *    summary: Modify an entry
 *    tags: [Entry]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: Entry id to modify
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/EntryPatch'
 *    responses:
 *      '200':
 *        description: Entry Modified
 */

// update entry
router.put(
  "/:id",
  [
    param("id").custom(isValidEntryById),
    body("title").optional().trim(),
    body("description").optional().trim(),
    body("updatedBy").exists().trim().withMessage("Updator name is required"),
  ],
  validateInputs,
  async (req: Request, res: Response) => {
    const id = req.params.id as FindOptionsWhere<Entry>;
    const entry = await dataSource.getRepository(Entry)?.findOneBy(id);
    if (entry) {
      entry.title = req.body.title;
      entry.description = req.body.description;
      entry.updatedBy = req.body.updatedBy;
      dataSource
        .getRepository(Entry)
        ?.save(entry)
        .then((entries) => {
          res.status(StatusCodes.OK).json(entries);
        })
        .catch((err) => {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: err });
        });
    }
  }
);

/**
 * @swagger
 * /entry/{id}:
 *  delete:
 *    summary: Delete an entry
 *    tags: [Entry]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: Entry id to delete
 *        schema:
 *          type: string
 *    responses:
 *      '200':
 *        description: Entry Deleted
 */

// delete entry
router.delete(
  "/:id",
  [param("id").custom(isValidEntryById)],
  validateInputs,
  async (req: Request, res: Response) => {
    const id = req.params.id as FindOptionsWhere<Entry>;
    const entry = await dataSource.getRepository(Entry)?.findOneBy(id);
    if (entry) {
      dataSource
        .getRepository(Entry)
        ?.remove(entry)
        .then((entries) => {
          res.status(StatusCodes.OK).json(entries);
        })
        .catch((err) => {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: err });
        });
    }
  }
);

export default router;
