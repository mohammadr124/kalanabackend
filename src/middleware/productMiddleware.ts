import type { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { verifyToken } from "../funcs/token.js";
import connectToDb from "../funcs/connection.js";
import userModel from "../models/user.js";
import { log } from "console";
import { isValidObjectId } from "mongoose";

const ALLOWED_MIMETYPES: string[] = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const isVaildImages = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const files = req.files as any;

  const { label, value } = req.body
  if(!Array.isArray(value) || value.length < 2 ||  !Array.isArray(label) || label.length < 2 ) {
    return res.status(400).json({
      success: false,
      title: "اطلاعات ارسال شده نامعتبر است",
      messages: "شما بایستی دو ویؤگی برای ثبت محصول بیان کنید",
    });
  }

  const productAtribute = label.map((l, i) => {
    return {
      label: l,
      value: value[i]
    }
  })

  req.body.productAtribute = productAtribute

  if (!files) {
    return res.status(400).json({
      success: false,
      title: "اطلاعات ارسال شده معتبر نیست",
      messages: "برای ایجاد فایل بایستی عکس را ارسال کنید",
    });
  }

  if (Array.isArray(files) && files.length <= 1) {
    return res.status(400).json({
      success: false,
      title: "اطلاعات ارسال شده معتبر نیست",
      messages: "برای ایجاد یک محصول حداقل بایستی 2 عکس وارد کنید",
    });
  }

  files.forEach((file: File | any, i: number) => {
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        title: "اطلاعات ارسال شده معتبر نیست",
        messages: `فرمت فایل شماره ${i + 1} معتبر نیست`,
      });
    }
  });

  next();
};

export const hasAccessForCreateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
    const user = await userModel.findOne({ email: tokenInfo?.email } as any);

    if (!user) {
      return res.status(404).json({
        success: false,
        title: "عدم دسترسی",
        messages: "کاربری یافت نشد",
      });
    }
    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        title: "عدم دسترسی",
        messages: "فقط مدیران سایت به این قابلیت دسترسی دارند",
      });
    }
    next();
  } catch (err) {
    log("error in has access create product middleware ====>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "سرور به مشکل خورده مدتی بعد تلاش نمایید",
    });
  }
};

export const isValidBody = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  log("body ===>", req.body);
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

export const HasAccessForDeleteApi = async (
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
    const user = await userModel.findOne({ email: tokenInfo?.email } as any);

    if (!user) {
      return res.status(404).json({
        success: false,
        title: "عدم دسترسی",
        messages: "کاربری یافت نشد",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        title: "عدم دسترسی",
        messages: "فقط مدیران سایت به این قابلیت دسترسی دارند",
      });
    }
    next();
  } catch (err) {
    console.log("error in delete product middleware ====>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "سرور به مشکل خورده مدتی بعد تلاش نمایید",
    });
  }
};

export const isValidId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params
  if(!id || !isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      title: "شناسه نامعتبر",
      messages: "شناسه ارسال شده معتبر نیست",
    });
  }

  const { label, value } = req.body
  if(!Array.isArray(value) || value.length < 2 ||  !Array.isArray(label) || label.length < 2 ) {
    return res.status(400).json({
      success: false,
      title: "اطلاعات ارسال شده نامعتبر است",
      messages: "شما بایستی دو ویؤگی برای ثبت محصول بیان کنید",
    });
  }

  const productAtribute = label.map((l, i) => {
    return {
      label: l,
      value: value[i]
    }
  })

  req.body.productAtribute = productAtribute
  next()
}