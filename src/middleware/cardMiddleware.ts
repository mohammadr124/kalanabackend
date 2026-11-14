import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { verifyToken } from "../funcs/token.js";
import connectToDb from "../funcs/connection.js";
import userModel from "../models/user.js";
import { isValidObjectId } from "mongoose";
import cardModel from "../models/card.js";

export const isValidBody = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array();
    return res.status(400).json({
      success: false,
      title: "درخواست نامعتبر به سرور",
      messages: errors,
    });
  }
  next();
};

export const hasAccessForCard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authToken = req.cookies.auth_token;
  if (!authToken) {
    return res.status(401).json({
      success: false,
      title: "عدم دسترسی",
      messages: "برای دسترسی به این قابلیت بایدابتدا وارد حساب کاربری خود شوید",
    });
  }

  const tokenInfo: any = verifyToken(authToken);
  if (!tokenInfo || !tokenInfo.email) {
    return res.status(401).json({
      success: false,
      title: "عدم دسترسی",
      messages: "برای دسترسی به این قابلیت بایدابتدا وارد حساب کاربری خود شوید",
    });
  }

  await connectToDb();
  try {
    const user = await userModel.findOne({ email: tokenInfo.email } as any);

    if (!user) {
      return res.status(404).json({
        success: false,
        title: "عدم دسترسی",
        messages: "کاربری با این اطلاعات یافت نشد",
      });
    }

    if (user.isBan) {
      return res.status(403).json({
        success: false,
        title: "عدم دسترسی",
        messages: "شما به علت مسدود شدم توسط مدیر این فروشگاه دسترسی ندارید",
      });
    }

    req.body.userId = user._id;
    next();
  } catch (err) {
    console.log("error in has access card middleware =>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "سرور یه مشکل خورد مدتی بعد تلاض نمایید",
    });
  }
};
 
export const hasAccessForRemoveItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authToken = req.cookies.auth_token;
  if (!authToken) {
    return res.status(401).json({
      success: false,
      title: "عدم دسترسی",
      messages: "برای دسترسی به این قابلیت بایدابتدا وارد حساب کاربری خود شوید",
    });
  }

  const tokenInfo: any = verifyToken(authToken);
  if (!tokenInfo || !tokenInfo.email) {
    return res.status(401).json({
      success: false,
      title: "عدم دسترسی",
      messages: "برای دسترسی به این قابلیت بایدابتدا وارد حساب کاربری خود شوید",
    });
  }

  await connectToDb();
  try {
    const { cardId } = req.body;
    const user = await userModel.findOne({ email: tokenInfo.email } as any);

    if (!user) {
      return res.status(404).json({
        success: false,
        title: "عدم دسترسی",
        messages: "کاربری با این اطلاعات یافت نشد",
      });
    }

    if (user.isBan) {
      return res.status(403).json({
        success: false,
        title: "عدم دسترسی",
        messages: "شما به علت مسدود شدم توسط مدیر این فروشگاه دسترسی ندارید",
      });
    }
    if (!isValidObjectId(cardId)) {
      return res.status(400).json({
        success: false,
        title: "درخواست نامعتبر به سرور",
        messages: "شناسه آیتم سبد خرید یا محصول نامعتبر است",
      });
    }
    const basketCard = await cardModel.findOne({ _id: cardId } as any);
    if (!basketCard) {
      return res.status(400).json({
        success: false,
        title: "درخواست نامعتبر به سرور",
        messages: "با این شناسه اطلاعات از سبد خرید شما یافت نشد",
      });
    }

    if (!basketCard.user.equals(user._id)) {
      return res.status(403).json({
        success: false,
        title: "عدم دسترسی",
        messages: "شما نمی توانید محصولی را از سبد خرید دیگران حذف کنید",
      });
    }

    next();
  } catch (err) {
    console.log("error in has access card middleware =>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "سرور یه مشکل خورد مدتی بعد تلاض نمایید",
    });
  }
};
