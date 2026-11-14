import type { Request, Response, NextFunction } from "express";
import connectToDb from "../funcs/connection.js";
import { verifyToken } from "../funcs/token.js";
import userModel from "../models/user.js";
import { isValidObjectId } from "mongoose";
import { log } from "console";

const ALLOWED_MIMETYPES: string[] = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const hasAccessForCreateBrand = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await connectToDb();
  try {
    const brandName: string = req.body.name;
    const brandDescription: string = req.body.description;
    const file = req.file;

    const authToken = req.cookies.auth_token;
    if (!authToken) {
      return res.status(401).json({
        success: false,
        title: "عدم دسترسی",
        messages: "ابتدا وارد حساب کاربری خود شوید",
      });
    }

    const tokenInfo: any = verifyToken(authToken);

    if (!tokenInfo.email) {
      return res.status(401).json({
        success: false,
        title: "عدم دسترسی",
        messages: "ابتدا وارد حساب کاربری خود شوید",
      });
    }

    const user = await userModel.findOne({ email: tokenInfo.email } as any);

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        title: "درخواست نامعتبر ",
        messages: "فقط مدیر سایت توانایی ایجاد یک برند را دارد",
      });
    }

    if (!brandName || !brandDescription || !file) {
      return res.status(400).json({
        success: false,
        title: "درخواست نامعتبر به سرور",
        messages: "اطلاعات ارسال شده نامعتبر است",
      });
    }

    if (!brandName.trim() || brandName.length < 5) {
      return res.status(400).json({
        success: false,
        title: "درخواست نامعتبر به سرور",
        messages: "نام برند ارسال شده بایستی نباید کمتر 5 کاراکتر باشد",
      });
    }

    if (
      !brandDescription.trim() ||
      brandDescription.length < 15
    ) {
      return res.status(400).json({
        success: false,
        title: "درخواست نامعتبر به سرور",
        messages: "توضیحات برند تباید کمتر 15 کاراکتر باشد",
      });
    }

    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        title: "درخواست نامعتبر به سرور",
        messages: "عکس ارسال شده نامعتبر است",
      });
    }

    next();
  } catch (error) {
    console.log("error in has access create brand middleware ====> ", error);
    return res.status(500).json({
      success: false,
      title: "خطا داخلی سرور",
      messages: "سرور با مشکلی غیر منتطره رو به رو شده مدتی بعد تلاش نمایید",
    });
  }
};

export const isAccessForGetBrands = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.query;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      success: false,
      title: "درخواست نامعتبر به سرور",
      messages: "ابتدا کوئری مورد نطر را ارسال نمایید",
    });
  }

  next();
  
};

export const isAccessForDeleteBrands = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params 

  if(!id || !isValidObjectId(id)){
     return res.status(400).json({
      success: false,
      title: "درخواست نامعتبر",
      messages: "درخواسست ارسال شده به سرور نامعتبر است",
    });
  }

  const authToken = req.cookies.auth_token;

  if (!authToken) {
    return res.status(401).json({
      success: false,
      title: "عدم دسترسی",
      messages: "ابتدا باید وارد حساب کاربری خود شوید",
    });
  }

  const tokenInfo: any = verifyToken(authToken);

  if (!tokenInfo?.email) {
    return res.status(401).json({
      success: false,
      title: "عدم دسترسی",
      messages: "ابتدا باید وارد حساب کاربری خود شوید",
    });
  }

  await connectToDb();
  try {
    const user = await userModel.findOne({ email: tokenInfo.email } as any);

    if (!user) {
      return res.status(404).json({
        success: false,
        title: "اطلاعات نامعتبر",
        messages: "کاربری با این اطلاعات یافت نشد",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        title: "دسترسی ناکافی",
        messages: "کاربر عادی دسترسی به این endpoint را ندارد",
      });
    }

    next();
  } catch (err) {
    console.log("error in access get brand midd ====>", err);
    return res.status(500).json({
      success: false,
      title: "خطای داخلی سرور ",
      messages: "خطایی داخلی سرور مدتی بعد تلاش نمایید",
    });
  }
};

export const hasAccessForUpdateBrandInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  if (!id || !isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      title: "شناسه ی نامعتبر",
      messages: "شناسه ی ارسال شده اعتبار ندارد",
    });
  }

  const authToken = req.cookies.auth_token;
  if (!authToken) {
    return res.status(401).json({
      success: false,
      title: "عدم دسترسی ",
      messages: "برای دسترسی ابتدا وارد حساب کاربری خود شوید",
    });
  }

  const tokenInfo: any = verifyToken(authToken);
  if (!tokenInfo) {
    return res.status(401).json({
      success: false,
      title: "عدم دسترسی ",
      messages: "برای دسترسی ابتدا وارد حساب کاربری خود شوید",
    });
  }

  if (!tokenInfo.email) {
    return res.status(401).json({
      success: false,
      title: "عدم دسترسی ",
      messages: "برای دسترسی ابتدا وارد حساب کاربری خود شوید",
    });
  }
  await connectToDb();
  try {
    const user = await userModel.findOne({ email: tokenInfo.email } as any);
    if (user.isBan) {
      return res.status(403).json({
        success: false,
        title: "عدم دسترسی",
        messages: "شما به علت بن شدن دسترسی ندارید",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        title: "عدم دسترسی",
        messages: "فقط مدیران سایت به این روت دسترسی دارند",
      });
    }

    
    const brandName: string = req.body.barndName;
    const brandDescription: string = req.body.barndDescription;
    const file = req.file;
    console.log(req.body);

    if (!brandName || !brandDescription) {
      return res.status(400).json({
        success: false,
        title: "درخواست نامعتبر به سرور",
        messages: "اطلاعات ارسال شده نامعتبر است",
      });
    }

    if (!brandName.trim() || brandName.length < 5) {
      return res.status(400).json({
        success: false,
        title: "درخواست نامعتبر به سرور",
        messages: "نام برند ارسال شده بایستی نباید کمتر 5 کاراکتر باشد",
      });
    }

    if (
      !brandDescription.trim() ||
      brandDescription.length < 15
    ) {
      return res.status(400).json({
        success: false,
        title: "درخواست نامعتبر به سرور",
        messages: "توضیحات برند تباید کمتر 15 کاراکتر باشد",
      });
    }

    if (!file) {
      next();
      return;
    }

    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        title: "درخواست نامعتبر به سرور",
        messages: "عکس ارسال شده نامعتبر است",
      });
    }

    next();
  } catch (err) {
    console.log("error in access update brand midd ====>", err);
    return res.status(500).json({
      success: false,
      title: "خطای داخلی سرور ",
      messages: "خطایی داخلی سرور مدتی بعد تلاش نمایید",
    });
  }
}