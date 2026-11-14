import express from "express";
import { body } from "express-validator";
import {
  checkCount,
  checkIsMyOrder,
  checkRole,
  getMyBasket,
  hasAccessForCreateOrder,
  isValidBodyforOrder,
} from "../middleware/orderMiddleware.js";
import {
  createorder,
  getOrder,
  updatePayment,
  updateShoppingStatus,
} from "../controller/orderController.js";

const orderRouter = express.Router();

orderRouter.post(
  "/create-order",
  body("receiverName")
    .notEmpty()
    .withMessage("نام شخص دریافت کننده نباید خالی باشد")
    .bail()
    .isLength({ min: 3 })
    .withMessage("نام دریافت کننده حداقل باید سه حرف داشته باشد"),
  body("receiverLastName")
    .notEmpty()
    .withMessage("نام خانوادگی شخص دریافت کننده نباید خالی باشد")
    .bail()
    .isLength({ min: 4 })
    .withMessage("نام خانوادگی دریافت کننده حداقل باید 4 حرف داشته باشد"),
  body("receiverPhone")
    .notEmpty()
    .withMessage("شماره موبایل دیافت کننده نباید خالی باشد")
    .bail()
    .isLength({ min: 11, max: 11 })
    .withMessage("شماره موبایل شما باید 11 کاراکتر باشد")
    .bail()
    .matches(/^(\+98|0098|98|0)?9\d{9}$/)
    .withMessage(
      "شماره موبایل شماره نامعتبر است از شماره موبایل معتبر استفاده کنید",
    ),
  body("receiverAddress")
    .notEmpty()
    .withMessage("استان محل سکونت دریافت کننده نباید خالی باشد")
    .bail()
    .isLength({ min: 4 })
    .withMessage("استان محل سکونت شما بیا حداقل از 5 حرف تشکیل شده باشد"),
  body("receiverCityAddress")
    .notEmpty()
    .withMessage("شهر سکونت دریافت کننده نباید خالی باشد")
    .bail()
    .isLength({ min: 4 })
    .withMessage("شهر سکونت شما باید حداقل از 4 حرف تشکیل شده باشد"),
  body("receiverMainAddress")
    .notEmpty()
    .withMessage("محل سکونت دریافت کننده نباید خالی باشد")
    .bail()
    .isLength({ min: 5 })
    .withMessage("محل سکونت شما باید حداقل از 5 حرف تشکیل شده باشد"),
  body("postCode")
    .notEmpty()
    .withMessage("کد پستی شما نباید خالی باشد")
    .bail()
    .matches(/^[13-9][13-9][13-9][13-9][13-9]\d{5}$/)
    .withMessage("از کد پستی معتبری استفاده کنید"),
  body("plaque")
    .notEmpty()
    .withMessage("پلاک و واحد محل سکونت دریافت کننده نباید خالی باشد")
    .bail()
    .isLength({ min: 5 })
    .withMessage(
      "پلاک و واحد محل سکونت شما باید حداقل از 5 حرف تشکیل شده باشد",
    ),
  isValidBodyforOrder,
  hasAccessForCreateOrder,
  getMyBasket,
  checkCount,
  createorder,
);

orderRouter.get("/get-all", checkRole, getOrder);
orderRouter.put(
  "/update-pay-status/:id",
  checkRole,
  checkIsMyOrder,
  updatePayment,
);
orderRouter.put(
  "/update-shopping-status/:id",
  checkRole,
  checkIsMyOrder,
  updateShoppingStatus,
);

export default orderRouter;
