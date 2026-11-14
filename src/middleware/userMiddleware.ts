import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { verifyToken } from "../funcs/token.js";
import type { JwtPayload } from "jsonwebtoken";
import connectToDb from "../funcs/connection.js";
import userModel from "../models/user.js";
import { token } from "morgan";

export const isAccessForRegisterApi = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array();
    return res.status(400).json({
      success: false,
      title: "درخواست بد به سرور",
      messages: errors,
    });
  }

  const authToken = req.cookies.auth_token;

  if (authToken) {
    const tokenInfo: string | JwtPayload | undefined | any =
      verifyToken(authToken);
    console.log(tokenInfo);
    if (tokenInfo.email) {
      return res.status(403).json({
        success: false,
        title: "عدم دسترسی",
        messages: "شما با این API دسترسی ندارید",
      });
    }
  }

  next();
};

export const isAccessForLoginApi = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array();
    return res.status(400).json({
      success: false,
      title: "درخواست بد به سرور",
      messages: errors,
    });
  }

  const authToken = req.cookies.auth_token;

  if (authToken) {
    const tokenInfo: string | JwtPayload | undefined | any =
      verifyToken(authToken);
    if (tokenInfo.email) {
      return res.status(403).json({
        success: false,
        title: "عدم دسترسی",
        messages: "شما از قبل در سایت حساب ایجاد کرده اید",
      });
    }
  }

  next();
};

export const isAccessForLogoutApi = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authToken = req.cookies.auth_token;

    if (!authToken) {
      return res.status(401).json({
        success: false,
        title: "عدم دسترسی",
        messages:
          "شما با این API دسترسی ندارید. ابتدا وارد حساب کاربری خود شوید",
      });
    }

    if (authToken) {
      const tokenInfo: string | JwtPayload | undefined | any =
        verifyToken(authToken);
      if (!tokenInfo.email) {
        return res.status(401).json({
          success: false,
          title: "عدم دسترسی",
          messages:
            "شما با این API دسترسی ندارید. ابتدا وارد حساب کاربری خود شوید",
        });
      }
    }

    next();
  } catch (error) {
    console.log("error in logout middleware =====>", error);
    return res.status(401).json({
      success: false,
      title: "عدم دسترسی",
      messages: "شما با این API دسترسی ندارید. ابتدا وارد حساب کاربری خود شوید",
    });
  }
};

export const isAccessForGetmeApi = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authToken = req.cookies.auth_token;
    if (!authToken) {
      return res.status(401).json({
        success: false,
        title: "عدم دسترسی",
        messages:
          "شما با این API دسترسی ندارید. ابتدا وارد حساب کاربری خود شوید",
      });
    }

    if (authToken) {
      const tokenInfo: string | JwtPayload | undefined | any =
        verifyToken(authToken);
      if (!tokenInfo.email) {
        return res.status(401).json({
          success: false,
          title: "عدم دسترسی",
          messages:
            "شما با این API دسترسی ندارید. ابتدا وارد حساب کاربری خود شوید",
        });
      }
    }
    next();
  } catch (error) {
    console.log("error in logout middleware =====>", error);
    return res.status(500).json({
      success: false,
      title: "خطای داخلی سرور",
      messages: "سرور به مشکل مدتی بعد مجددا تلاش نمایید",
    });
  }
};

export const hasAccessForChangePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await connectToDb();
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array();
      return res.status(400).json({
        success: false,
        title: "اطلاعات نامعتبر",
        messages: errors,
      });
    }

    const { phone, resetToken } = req.body;
    const userInfo = await userModel.findOne({ phone } as any);

    if (!userInfo) {
      return res.status(404).json({
        success: false,
        title: "کاربری یافت نشد",
        messages: "کاربری با این شماره موبایل یافت نشد",
      });
    }

    if (!userInfo.resetToken || userInfo.resetToken !== resetToken) {
      return res.status(401).json({
        success: false,
        title: "توکن نامعتبر",
        messages: "توکن ارسال شده نامعتبر است",
      });
    }

    if (userInfo.resetTokenexpTime < Date.now()) {
      return res.status(410).json({
        success: false,
        title: "توکن نامعتبر",
        messages: "توکن ارسال شده منقضی شده",
      });
    }

    next();
  } catch (error) {
    console.log("error in logout middleware =====>", error);
    return res.status(500).json({
      success: false,
      title: "خطای داخلی سرور",
      messages: "سرور به مشکل مدتی بعد مجددا تلاش نمایید",
    });
  }
};

export const hasAccessForGetAllUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await connectToDb();
  try {
    const authToken = req.cookies.auth_token;

    if (!authToken) {
      return res.status(401).json({
        success: false,
        title: "عدم دسترسی ",
        messages: "فقط مدیر سایت به این api دسترسی دارد",
      });
    }

    const tokenInfo: any = verifyToken(authToken);

    if (!tokenInfo) {
      return res.status(401).json({
        success: false,
        title: "عدم دسترسی ",
        messages: "فقط مدیر سایت به این api دسترسی دارد",
      });
    }

    if (!tokenInfo.email) {
      return res.status(401).json({
        success: false,
        title: "عدم دسترسی ",
        messages: "فقط مدیر سایت به این api دسترسی دارد",
      });
    }

    const user = await userModel.findOne({ email: tokenInfo.email } as any);
    const role = user.role;

    if (role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        title: "عدم دسترسی ",
        messages: "شما به دسترسی کافی ندارید",
      });
    }

    next();
  } catch (err) {
    console.log("error in get all user mddleware =====> ", err);
    return res.status(500).json({
      success: false,
      title: "خطای داخلی سرور",
      messages: "سرور به مشکل مدتی بعد مجددا تلاش نمایید",
    });
  }
};

export const hasAccessForUpdateInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = validationResult(req)
  if(!result.isEmpty()) {
    const errors = result.array();
    return res.status(400).json({
      success: false,
      title: "اطلاعات نا معتبر",
      messages: errors,
    });
  }

  const authToken = req.cookies.auth_token;
  if(!authToken) {
    return res.status(401).json({
      success: false,
      title: "عدم دسترسی",
      messages: "ابتدا وراد حساب کاربری خود شوید",
    });
  }
  const tokenInfo:any = verifyToken(authToken)
  if(!tokenInfo || !tokenInfo?.email) {
    return res.status(401).json({
      success: false,
      title: "عدم دسترسی",
      messages: "ابتدا وراد حساب کاربری خود شوید",
    });
  }
  await connectToDb()
  try {
    const user = await userModel.findOne({email: tokenInfo.email} as any)
    if(!user){
      return res.status(404).json({
        success: false,
        title: "کاربری یافت نشد",
        messages: "کاربری با اطلاعات یافت نشد",
      });
    }

    if(user.isBan) {
      return res.status(403).json({
        success: false,
        title: "عدم دسترسی",
        messages: "شما به دلیل مسدود شدن دسترسی ندارید",
      });
    }
    next()
  } catch (err) {
    console.log("error in chanege user info middleware =====>", err);
    return res.status(500).json({
      success: false,
      title: "خطای داخلی سرور",
      messages: "سرور به مشکل مدتی بعد مجددا تلاش نمایید",
    });
  }
};