// import type { Request, Response } from "express";
import type { Request, Response } from "express";
import connectToDb from "../funcs/connection.js";
import { isValidObjectId } from "mongoose";
import cardModel from "../models/card.js";
import productModel from "../models/product.js";
import userModel from "../models/user.js";
import { verifyToken } from "../funcs/token.js";

export const createItem = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const { productId, userId, count } = req.body;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        title: "درخواست نامعتبر به سرور",
        messages: "شناسه محصول نامعتبر است",
      });
    }

    const isExsitProductInCard = await cardModel.findOne({
      $and: [{ product: productId }, { user: userId }],
    } as any);

    if (isExsitProductInCard) {
      return res.status(409).json({
        success: false,
        title: "محصول تکراری",
        messages: "این محصول قبلاً به سبد خرید اضافه شده است.",
      });
    }

    const product = await productModel.findOne({ _id: productId } as any);

    if (!product) {
      return res.status(404).json({
        success: false,
        title: "اطلاعات ارسال شده معتبر نیست",
        messages: "محصولی با این شناسه یافت نشده",
      });
    }

    if (!product.count) {
      return res.status(409).json({
        success: false,
        title: "موجودی نا کافی",
        messages: "این محصول در انبار وجود ندارد",
      });
    }

    const oldCount = product.count;

    if (oldCount < count) {
      return res.status(409).json({
        success: false,
        title: "موجودی نا کافی",
        messages: "در انبار به تعداد درخواست شما محصول وجود ندارد",
      });
    }


    await cardModel.create({
      user: userId,
      product: productId,
      count: count,
    });

    return res.status(201).json({
      success: true,
      title: "عملیات موفقیت آمیز",
      messages: "محصول با موفقیت به سبد خرید شما اضافه شد",
    });
  } catch (err) {
    console.log("error in create card item api => ", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "خطایی به دور از انتظار به وجود آمده مدتی بعد تلاش نمایید",
    });
  }
};

export const getMyCard = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const authToken = req.cookies.auth_token;
    if (!authToken) {
      return res.status(401).json({
        success: false,
        title: "عدم دسترسی",
        messages:
          "برای دسترسی به این قابلیت بایدابتدا وارد حساب کاربری خود شوید",
      });
    }

    const tokenInfo: any = verifyToken(authToken);
    if (!tokenInfo || !tokenInfo.email) {
      return res.status(401).json({
        success: false,
        title: "عدم دسترسی",
        messages:
          "برای دسترسی به این قابلیت بایدابتدا وارد حساب کاربری خود شوید",
      });
    }

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

    const cardData = await cardModel
      .find({ user: user._id } as any)
      .populate({ path: "user", select: "_id name lastName" })
      .populate({ path: "product",select: "title images price intro"})
      .lean().sort({createdAt: -1})


    const price = cardData.reduce((acc, curr) => {
     return  acc +(curr?.product?.price* curr?.count)
    } ,0)
    
    res.json({
        price,
      cardData,
    });
  } catch (err) {
    console.log('error in get my basket api => ',err );
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "خطایی به دور از انتظار به وجود آمده مدتی بعد تلاش نمایید",
    });
  }
};

export const removeItem =  async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const { cardId } = req.body;

    await cardModel.findOneAndDelete({ _id: cardId } as any)

    return res.json({
      success: true,
      title: "عملیات با موفقیت انجام شد",
      messages: "محصول از سبد خرید شما حذف شد",
    });
  } catch (err) {
    console.log("error in delete basket item api => ", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "خطایی به دور از انتظار به وجود آمده مدتی بعد تلاش نمایید",
    });
  }
}