import express from "express";
import { body } from "express-validator";
import {
  hasAccessGetComment,
  islogin,
  isvalidBody,
} from "../middleware/commentsMiddleware.js";
import {
  createComment,
  getAllComments,
  updateComment,
} from "../controller/commentControler.js";

const commentRouter = express.Router();

commentRouter.post(
  "/create-comment",
  body("star")
    .notEmpty()
    .withMessage("تعداد ستاره ها نباید خالی باشد")
    .bail()
    .toFloat()
    .isNumeric()
    .withMessage("مقدار ستاره ها بایستی عدد باشد")
    .bail()
    .isFloat({ min: 0, max: 5 })
    .withMessage("مقدار ستاره ها باید بین 0 تا 5 باشد"),
  body("product").notEmpty().withMessage("شناسه ی محصول نباید خالی باشد"),
  body("text")
    .notEmpty()
    .withMessage("متن نظر شما نباید خالی باشد")
    .bail()
    .isLength({ min: 15 })
    .withMessage("متن نظر شما نباید کمتر از 15 کاراکتر باشد"),
  isvalidBody,
  islogin,
  createComment,
);

commentRouter.get("/get-all", hasAccessGetComment, getAllComments);
commentRouter.put("/update-comment/:id", hasAccessGetComment, updateComment);

export default commentRouter;
