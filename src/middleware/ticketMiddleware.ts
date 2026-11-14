import { type NextFunction, type Request, type Response } from "express";
import { validationResult } from "express-validator";
import { verifyToken } from "../funcs/token.js";
import connectToDb from "../funcs/connection.js";
import userModel from "../models/user.js";

export const isAccessForCreateTicket = async (
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
        title: "اطلاعات نامعتبر ",
        messages: errors,
      });
    }

    const authToken = req.cookies.auth_token;

    if (!authToken) {
      return res.status(401).json({
        success: false,
        title: "دسترسی برای ساخت تیکت ندارید",
        messages: "ابتدا وارد حساب کاربری خود شوید",
      });
    }

    const tokenInfo: any = verifyToken(authToken);
    if (authToken) {
      if (!tokenInfo?.email) {
        return res.status(401).json({
          success: false,
          title: "دسترسی برای ساخت تیکت ندارید",
          messages: "ابتدا وارد حساب کاربری خود شوید",
        });
      }
    }

    const user = await userModel.findOne({ email: tokenInfo?.email } as any);

    if (!user) {
      return res.status(404).json({
        success: false,
        title: "دیتایی با این مشخصات یافت نشد",
        messages: "دیتایی با این مشخصات یافت نشد",
      });
    }

    if (user.role === "ADMIN") {
      return res.status(403).json({
        success: false,
        title: "عدم دسترسی",
        messages: "مدیر سابت توانایی ایجاد تیکت را ندارد",
      });
    }

    next();
  } catch (error) {
    console.log("error in has accsess create ticket Api ===>", error);
    return res.status(500).json({
      success: false,
      title: "خطای سرور ",
      messages: "مشکل در سرور به وجود آمده مدتی بعد تلاش نمایید",
    });
  }
};
