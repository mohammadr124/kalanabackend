import express from "express";
import { body } from "express-validator";
import { isAccessForSendOtpCode } from "../middleware/otpMiddleware.js";
import { sendOtpCode, verifyOtpCoede } from "../controller/otpController.js";
const otpRouter = express.Router();

otpRouter.post(
  "/send-code",
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("شماره موبایل نباید خالی باشد")
    .bail()
    .matches(/^(\+98|0098|98|0)?9\d{9}$/)
    .withMessage("شماره موبایل نامعتبراز شماره موبایل دیگری استفاده کنبد"),
  isAccessForSendOtpCode,
  sendOtpCode,
);
otpRouter.post(
  "/verify-code",
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("شماره موبایل نباید خالی باشد")
    .bail()
    .matches(/^(\+98|0098|98|0)?9\d{9}$/)
    .withMessage("شماره موبایل نامعتبراز شماره موبایل دیگری استفاده کنبد"),
  body("code")
    .notEmpty()
    .withMessage("کد پیامکی نباید خالی باشد")
    .bail()
    .isInt()
    .withMessage("کد پیامکی باید عدد باشد"),
  isAccessForSendOtpCode,
  verifyOtpCoede,
);

export default otpRouter;
