import express from "express";
import { body } from "express-validator";
import {
  hasAccessForCreateProduct,
  HasAccessForDeleteApi,
  isVaildImages,
  isValidBody,
  isValidId,
} from "../middleware/productMiddleware.js";
import uploader from "../middleware/multer.js";
import {
  createProducyFunc,
  deleteProduct,
  getOneProduct,
  getProduct,
  updateProduct,
} from "../controller/productController.js";

const producRouter = express.Router();

producRouter.post(
  "/create-product",
  uploader.array("images", 7),
  isVaildImages,
  hasAccessForCreateProduct,
  body("title")
    .notEmpty()
    .withMessage("عنوان محصول نباید خالی باشد")
    .bail()
    .isLength({ min: 3 })
    .withMessage("عنوان محصول حداقل بایستی 3 کاراکتر باشد"),
  body("category")
    .notEmpty()
    .withMessage("دسته بندی محصول نباید خالی باشد")
    .bail()
    .isLength({ min: 3 })
    .withMessage("دسته بندی محصول حداقل بایستی 3 کاراکتر باشد"),
  body("brand")
    .notEmpty()
    .withMessage("برند محصول نباید خالی باشد")
    .bail()
    .isLength({ min: 3 })
    .withMessage("برند محصول حداقل بایستی 3 کاراکتر باشد"),
  body("atributes")
    .isArray({ min: 2 })
    .withMessage("شما بایستی برای محصول دو ویژگی تعریف کنید"),
  body("atributes.*")
    .notEmpty()
    .withMessage("ویژگی محصول نباید خالی باشد")
    .bail()
    .isLength({ min: 3 })
    .withMessage("ویژگی محصول حداقل بایستی 3 کاراکتر باشد"),
  body("price")
    .notEmpty()
    .withMessage("قیمت محصول نبایستی خالی باشد")
    .bail()
    .toFloat()
    .isNumeric()
    .withMessage("قیمت محصول بایستی عدد  باشد")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("قیمت وارد شده باید بیشتر از صفر باشد"),
  body("count")
    .notEmpty()
    .withMessage("تعداد محصول نبایستی خالی باشد")
    .bail()
    .toFloat()
    .isNumeric()
    .withMessage("تعداد محصول بایستی عدد باشد")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("تعداد وارد شده باید بیشتر از صفر باشد"),
  body("intro")
    .notEmpty()
    .withMessage("معرفی محصول نباید خالی باشد")
    .bail()
    .isLength({ min: 15 })
    .withMessage("معرفی محصول نباید کمتر 15 کاراکتر باشد"),
  body("productAtribute")
    .isArray({ min: 2 })
    .withMessage("شما بایستی حداقل 2 مشخصه برای محصول وارد کنید"),
  body("productAtribute.*.label")
    .notEmpty()
    .withMessage("برچسب مشخصه ی مصول نباید خالی باشد")
    .bail()
    .isLength({ min: 3 })
    .withMessage(" برچسب مشخصه حداقل 3 کاراکتر داشته باشد"),
  body("productAtribute.*.value")
    .notEmpty()
    .withMessage("مقدار مشخصه ی مصول نباید خالی باشد")
    .bail()
    .isLength({ min: 3 })
    .withMessage(" مقدار مشخصه حداقل 3 کاراکتر داشته باشد"),
  isValidBody,
  createProducyFunc,
);

producRouter.get("/get-product", getProduct);
producRouter.get("/get-product/:id", getOneProduct);
producRouter.delete(
  "/delete-product/:id",
  HasAccessForDeleteApi,
  deleteProduct,
);

producRouter.put(
  "/update-product/:id",
  uploader.none(),
  hasAccessForCreateProduct,
  isValidId,
  body("title")
    .notEmpty()
    .withMessage("عنوان محصول نباید خالی باشد")
    .bail()
    .isLength({ min: 3 })
    .withMessage("عنوان محصول حداقل بایستی سه کاراکتر باشد"),
  body("category")
    .notEmpty()
    .withMessage("دسته بندی محصول نباید خالی باشد")
    .bail()
    .isLength({ min: 3 })
    .withMessage("دسته بندی محصول حداقل بایستی سه کاراکتر باشد"),
  body("brand")
    .notEmpty()
    .withMessage("برند محصول نباید خالی باشد")
    .bail()
    .isLength({ min: 3 })
    .withMessage("برند محصول حداقل بایستی سه کاراکتر باشد"),
  body("atributes")
    .isArray({ min: 2 })
    .withMessage(
      "برای ساخت یک محصول شما بایستی حداقل دو ویژگی برای آن درج کنید",
    ),
  body("atributes.*")
    .notEmpty()
    .withMessage("ویژگی های محصول نبایدخالی باشد")
    .bail()
    .isLength({ min: 3 })
    .withMessage("ویژگی هر محصول بایستی حداقل 3 کاراکتر داشته باشد"),
  body("price")
    .notEmpty()
    .withMessage("قیمت محصول نبایدخالی باشد")
    .bail()
    .toFloat()
    .isNumeric()
    .withMessage("قیمت محصول بایستی عدد باشد")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("قیمت محصول نباید صفر تومان باشد"),
  body("count")
    .notEmpty()
    .withMessage("قیمت محصول نبایدخالی باشد")
    .bail()
    .toFloat()
    .isNumeric()
    .withMessage("قیمت محصول بایستی عدد باشد")
    .bail()
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("تعداد محصول نباید صفر باشد"),
  body("intro")
    .notEmpty()
    .withMessage("برند محصول نباید خالی باشد")
    .bail()
    .isLength({ min: 15 })
    .withMessage("برند محصول حداقل بایستی 15 کاراکتر باشد"),
  body("productAtribute")
    .isArray({ min: 2 })
    .withMessage("برای ایجاد یک محصول شما بایستی حداقل 2 مشخصه وارد کنیذ"),
  body("productAtribute.*.label")
    .notEmpty()
    .withMessage("برچسب محصول شما نیابد خالی باشد")
    .bail()
    .isLength({ min: 3 })
    .withMessage("برچسب محصول حداقل بایستی 3 کاراکتر باشد"),
  body("productAtribute.*.value")
    .notEmpty()
    .withMessage("مفدار محصول شما نیابد خالی باشد")
    .bail()
    .isLength({ min: 3 })
    .withMessage("مقدار محصول حداقل بایستی 3 کاراکتر باشد"),
  isValidBody,
  updateProduct,
);

export default producRouter;
