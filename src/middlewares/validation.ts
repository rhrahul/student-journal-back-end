import { Request, Response, NextFunction } from "express";

const { validationResult } = require("express-validator");

const { StatusCodes } = require("http-status-codes");

import Entry from "../entities/entry.entity";
import Quote from "../entities/quote.entity";
import dataSource from "../dataSource";

export const validateInputs = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
  }
  next();
};

export const isValidEntryById = (id: any) => {
  return dataSource
    .getRepository(Entry)
    ?.findOneBy(id)
    .then((entry) => {
      if (!entry) {
        return Promise.reject("Entry does not exist");
      }
    });
};

export const isValidQuoteById = (id: any) => {
  return dataSource
    .getRepository(Quote)
    ?.findOneBy(id)
    .then((quote) => {
      if (!quote) {
        return Promise.reject("Quote does not exist");
      }
    });
};
