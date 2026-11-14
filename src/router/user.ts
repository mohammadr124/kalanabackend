import express from "express";
import type { Router } from "express";
import { body } from "express-validator";
import {
  hasAccessForChangePassword,
  hasAccessForGetAllUser,
  hasAccessForUpdateInfo,
  isAccessForGetmeApi,
  isAccessForLoginApi,
  isAccessForLogoutApi,
  isAccessForRegisterApi,
} from "../middleware/userMiddleware.js";
import {
  allUserFunc,
  banUser,
  changePassword,
  createAdminUser,
  getmeFunc,
  loginFunc,
  logoutFunc,
  registerFunc,
  updateInfoFunc,
} from "../controller/userController.js";

const userRoute: Router = express.Router();

userRoute.post(
  "/register",
  body("name")
    .trim()
    .notEmpty()
    .withMessage("نام شما نباید خالی باشد")
    .isLength({ min: 3 })
    .withMessage("نام شما نباید کمتر از 3 حرف باشد"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("نام خانوادگی شما نیاید خالی باشد")
    .isLength({ min: 5 })
    .withMessage("نام خانوادگی شما نباید کمتر 5 حرف باشد"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("شماره موبایل نباید خالی باشد")
    .matches(/^(\+98|0098|98|0)?9\d{9}$/)
    .withMessage(
      "شماره موبایل شماره نامعتبر است از شماره موبایل معتبر استفاده کنید",
    ),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("ایمیل شما نباید خالی باشد")
    .isEmail()
    .withMessage("ایمیل نامعتبر است شما باید از ایمیل معتبر استفاده کنید"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("رمز عبور نمس تواند خالی باشد")
    .isLength({ min: 8 })
    .withMessage("رمز عبور شما نباید کمتر از 8 حرف باشد"),
  isAccessForRegisterApi,
  registerFunc,
);
userRoute.post(
  "/login",
  body("email")
    .trim()
    .notEmpty()
    .withMessage("ایمیل شما نباید خالی باشد")
    .isEmail()
    .withMessage("ایمیل نامعتبر است شما باید از ایمیل معتبر استفاده کنید"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("رمز عبور نمس تواند خالی باشد")
    .isLength({ min: 8 })
    .withMessage("رمز عبور شما نباید کمتر از 8 حرف باشد"),
  isAccessForLoginApi,
  loginFunc,
);
userRoute.get("/get-me", isAccessForGetmeApi, getmeFunc);
userRoute.post("/logout", isAccessForLogoutApi, logoutFunc);
userRoute.put(
  "/change-password",
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("شماره موبایل نباید خالی باشد")
    .matches(/^(\+98|0098|98|0)?9\d{9}$/)
    .withMessage(
      "شماره موبایل شماره نامعتبر است از شماره موبایل معتبر استفاده کنید",
    ),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("رمز عبور نمس تواند خالی باشد")
    .isLength({ min: 8 })
    .withMessage("رمز عبور شما نباید کمتر از 8 حرف باشد"),
  body("resetToken")
    .trim()
    .notEmpty()
    .withMessage("توکن تغییر رمز عبور نیاید خالی باشد"),
  hasAccessForChangePassword,
  changePassword,
);
userRoute.get("/get-all-user", hasAccessForGetAllUser, allUserFunc)
userRoute.put("/ban-user/:id", hasAccessForGetAllUser, banUser)
userRoute.put("/generate-admin/:id", hasAccessForGetAllUser, createAdminUser)
userRoute.put(
  "/update-info",
  body("name")
    .trim()
    .notEmpty()
    .withMessage("نام شما نباید خالی باشد")
    .bail()
    .isLength({ min: 3 })
    .withMessage("نام شما نباید کمتر از 3 حرف باشد"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("نام خانوادگی شما نیاید خالی باشد")
    .bail()
    .isLength({ min: 5 })
    .withMessage("نام خانوادگی شما نباید کمتر 5 حرف باشد"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("ایمیل شما نباید خالی باشد")
    .bail()
    .isEmail()
    .withMessage("ایمیل نامعتبر است شما باید از ایمیل معتبر استفاده کنید"),
  hasAccessForUpdateInfo,
  updateInfoFunc,
);

export default userRoute;
