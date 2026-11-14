import type { Router } from "express";
import express from "express";
import { body } from "express-validator";
import { isValidBody } from "../middleware/productMiddleware.js";
import { hasAccessForCard, hasAccessForRemoveItem } from "../middleware/cardMiddleware.js";
import {
  createItem,
  getMyCard,
  removeItem,
} from "../controller/cardController.js";

const cardRouter: Router = express.Router();

cardRouter.post(
  "/add",
  body("productId")
    .notEmpty()
    .withMessage("شناسه محصول برای اضافه شدن از سبد خرید شما الزامی است"),
  body("count")
    .notEmpty()
    .withMessage("تعداد محصول خود را وارد کنبد")
    .bail()
    .toFloat()
    .isNumeric()
    .withMessage("تعداد مورد نظر بایستی عدد باشد")
    .isFloat({ gt: 0 })
    .withMessage("تعداد محصول حداقل بایستی بزرگتر از صفر باشد"),
  isValidBody,
  hasAccessForCard,
  createItem,
);

cardRouter.delete(
  "/remove",
  body("cardId")
    .notEmpty()
    .withMessage("شناسه این آیتم برای حذف شدن از سبد خرید شما الزامی است"),
  isValidBody,
  hasAccessForRemoveItem,
  removeItem,
);

cardRouter.get("/gat-card", getMyCard);

export default cardRouter;
