import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import connectToDb from "../funcs/connection.js";
import userModel from "../models/user.js";
import { verifyToken } from "../funcs/token.js";
import cardModel from "../models/card.js";
import productModel from "../models/product.js";
import { isValidObjectId } from "mongoose";
import orderModel from "../models/order.js";

export const isValidBodyforOrder = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array();
    return res.status(400).json({
      success: false,
      title: "اطاعات ارسال شده معتبر نیست",
      messages: errors,
    });
  }
  next();
};

export const hasAccessForCreateOrder = async (
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

    if (user.isBan) {
      return res.status(403).json({
        success: false,
        title: "عدم دسترسی",
        messages: "به علت مسدود شدن شما به ثبت سفارش دسترسی ندارید",
      });
    }

    req.body.userId = user._id;
    next();
  } catch (err) {
    console.log("error in create order middleware ====>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "سرور به مشکل خورده مدتی بعد تلاش نمایید",
    });
  }
};

export const getMyBasket = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await connectToDb();
  try {
    const { userId } = req.body;

    const myBasket = await cardModel
      .find({ user: userId } as any)
      .populate({ path: "product", select: "_id images title intro price" })
      .lean();

    if (!myBasket.length) {
      return res.status(400).json({
        success: false,
        title: "درخواست نامعتبر",
        messages: "سبد خرید شما خالی است",
      });
    }

    const totalPrice = myBasket.reduce(
      (acc, curr) => acc + curr.product.price * curr.count,
      0,
    );

    req.body.price = totalPrice;
    req.body.items = myBasket;

    next();
  } catch (err) {
    console.log("error in get my order middleware ====>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "سرور به مشکل خورده مدتی بعد تلاش نمایید",
    });
  }
};

export const checkCount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await connectToDb();
  try {
    const { items } = req.body;
    const productIds = items.map((item: any) => item.product._id);
    const products = await Promise.all(
      productIds.map((id: string) =>
        productModel.findOne({ _id: id } as any, "title count _id"),
      ),
    );

    const missingIndex = products.findIndex((product) => !product);

    if (missingIndex !== -1) {
      return res.status(404).json({
        success: false,
        title: "محصولی با این شناسه یافت نشد",
        messages: `محصول شماره ${missingIndex + 1} یافت نشد`,
      });
    }

    for (let i = 0; i < products.length; i++) {
      const product = products[i]!;
      const requestedCount = items[i].count;

      if (product.count <= 0) {
        return res.status(400).json({
          success: false,
          title: `محصول ${product.title} در انبار موجود نیست`,
          messages: `محصول ${product.title} در انبار موجود نیست`,
        });
      }

      if (requestedCount > product.count) {
        return res.status(400).json({
          success: false,
          title: `محصول ${product.title} به اندازه سفارش شما موجود نیست`,
          messages: `موجودی فعلی: ${product.count}، تعداد درخواستی: ${requestedCount}`,
        });
      }
    }

    req.body.productIds = productIds;

    next();
  } catch (err) {
    console.log("error in check count middleware ====>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "سرور به مشکل خورده مدتی بعد تلاش نمایید",
    });
  }
};

export const checkRole = async (
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

    if (user.isBan) {
      return res.status(403).json({
        success: false,
        title: "عدم دسترسی",
        messages: "به علت مسدود شدن شما به ثبت سفارش دسترسی ندارید",
      });
    }

    res.locals.userRole = user.role;
    res.locals.userId = user._id;
    next();
  } catch (err) {
    console.log("error in get order middleware ====>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "سرور به مشکل خورده مدتی بعد تلاش نمایید",
    });
  }
};

export const checkIsMyOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await connectToDb();
  try {
    const { id } = req.params;
    const userId = res.locals.userId;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        title: "اطلاعات ارسال شده نامعتبر است",
        messages: "شناسه سفارش ارسال شده معتبر نیست",
      });
    }

    const order = await orderModel.findOne({ _id: id } as any);

    if (!order) {
      return res.status(404).json({
        success: false,
        title: "اطلاعات ارسال شده نامعتبر است",
        messages: "سفارشی با اسن شناسه یافت نشد",
      });
    }


    console.log(order.orderOwner , userId  )
    if (!order.orderOwner.equals(userId)) {
      return res.status(403).json({
        success: false,
        title: "عدم دسترسی ",
        messages: "فقط صاحب سفارش به این قابلیت دسترسی دارد",
      });
    }
    res.locals.orederId = id;
    next();
  } catch (err) {
    console.log("error is mine order middleware ====>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "سرور به مشکل خورده مدتی بعد تلاش نمایید",
    });
  }
};
