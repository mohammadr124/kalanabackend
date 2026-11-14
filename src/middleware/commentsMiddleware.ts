import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { verifyToken } from "../funcs/token.js";
import connectToDb from "../funcs/connection.js";
import userModel from "../models/user.js";

export const isvalidBody = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array();
    return res.status(400).json({
      success: false,
      title: "شناسه نامعتبر",
      messages: errors,
    });
  }
  next();
};

export const islogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authToken = req.cookies.auth_token;
  if (!authToken) {
    return res.status(401).json({
      success: false,
      title: "عدم دسترس",
      messages: "برای ثبت نظر خود باید وارد حساب کاربری خود شوید",
    });
  }
  const tokenInfo: any = verifyToken(authToken);
  if (!tokenInfo || !tokenInfo?.email) {
    return res.status(401).json({
      success: false,
      title: "عدم دسترس",
      messages: "برای ثبت نظر خود باید وارد حساب کاربری خود شوید",
    });
  }

  const email = tokenInfo?.email;
  await connectToDb();
  try {
    const user = await userModel.findOne({ email } as any);
    if (!user) {
      return res.status(404).json({
        success: false,
        title: "کاربری یافت نشد",
        messages: "کاربری با این شناسه یافت نشد",
      });
    }

    if (user.isBan) {
      return res.status(403).json({
        success: false,
        title: "عدم دسترسی",
        messages: "شما به علت مسدود شدن توانایی ایجاد نظر را نداید",
      });
    }

    req.body.userId = user._id;
    next();
  } catch (err) {
    console.log("error in is login middleware =>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور ",
      messages: "سرور به مشکل برخورد مدتی بعد تلاش نمایید",
    });
  }
};

export const hasAccessGetComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await connectToDb();
  try {
    const authToken = req.cookies.auth_token
    if(!authToken) {
      return res.status(401).json({
        success: false,
        title: "عدم دسترسی",
        messages: "برای دسترسی شما باید ابتدا وارد حساب کاربری خود شوید",
      });
    }

    const tokenInfo: any = verifyToken(authToken)

    if(!tokenInfo || !tokenInfo?.email) {
      return res.status(401).json({
        success: false,
        title: "عدم دسترسی",
        messages: "برای دسترسی شما باید ابتدا وارد حساب کاربری خود شوید",
      });
    }

    const user = await userModel.findOne({email: tokenInfo?.email} as any)
    if(!user) {
      return res.status(404).json({
        success: false,
        title: "اطلاعاتی یافت نشد",
        messages: "کاربری با این شناسه یافت نشد",
      });
    }

    if(user.isBan) {
      return res.status(403).json({
        success: false,
        title: "عدم دسترسی",
        messages: "شما به دلیل مسدود شدن دسترسی ندارید",
      });
    }

    if(user.role !== "ADMIN"){
      return res.status(403).json({
        success: false,
        title: "عدم دسترسی",
        messages: "فقط مدیران سایت به این قابلیت دسترسی دارند",
      });
    }
    next()
  } catch (err) {
    console.log("error in has access get chat middleware =>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور ",
      messages: "سرور به مشکل برخورد مدتی بعد تلاش نمایید",
    });
  }
};

