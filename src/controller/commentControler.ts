import type { Request, Response,  } from "express"
import connectToDb from "../funcs/connection.js";
import { isValidObjectId } from "mongoose";
import productModel from "../models/product.js";
import commentModel from "../models/comment.js";
import { log } from "console";

export const createComment = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const { star, product, text, userId } = req.body;

    if (!isValidObjectId(product)) {
      return res.status(400).json({
        success: false,
        title: "شناسه ی نامعتبر",
        messages: "شناسه محصول معتبر نیست",
      });
    }
    await productModel.findOne({ _id: product } as any);
    if (!product) {
      return res.status(404).json({
        success: false,
        title: "شناسه محصول معتبر نمی باشد",
        messages: "محصولی با این سناسه یافت نشد",
      });
    }

    await commentModel.create({
      star,
      author: userId,
      product,
      text,
      isShow: false,
    });

    const comments = await commentModel.find({
      $and: [{ product }, { isShow: true }],
    } as any);

    
    const stars: number[] = comments.map((comment) => comment.star);
    if(stars.length) {
      const sumStar = stars.reduce((acc, current) => acc + current, 0);
      const avg = sumStar / stars.length;

      await productModel.findOneAndUpdate(
        { _id: product } as any,
        {
          rate: avg,
        },
        { new: false } as any,
      );
    }
   

    return res.status(201).json({
      success: true,
      title: "عملیات موفقیت آمیز",
      messages: "نظر شما با موفقیت ثبت شد",
    });
  } catch (err) {
    console.log("error in create comments api =>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور ",
      messages: "سرور به مشکل برخورد مدتی بعد تلاش نمایید",
    });
  }
}

export const getAllComments =  async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const { id } = req.query

    if(!id || isNaN(+id)) {
      return res.status(400).json({
        success: false,
        title: "شناسه نامعتبر",
        messages: "لطفا کوئری مربوط را وارد نمایید",
      });
    }

    const dataCount = 20
    const skip = (+id- 1) *dataCount


    const comments = await commentModel
      .find({} as any, "-__v")
      .limit(dataCount)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate({path: "author", select: "name lastName -_id"})
      .populate({path: "product", select: "title images -_id"})

    const all = await commentModel.countDocuments()
    const showComment = await commentModel.countDocuments({isShow: true})

    return res.json({
      success: true,
      title: "عملیات با موفقیت انجام شد",
      messages: "اطلاعات با موفقیت برای شما ارسال شد",
      data: {
        comments,
        all,
        showComment,
        notShow: all- showComment
      }
    });
  } catch (err) {
    console.log("error in get all comments api =>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور ",
      messages: "سرور به مشکل برخورد مدتی بعد تلاش نمایید",
    });
  }
}

export const updateComment = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const { id } = req.params;
    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        title: "شناسه ی نامعتبر",
        messages: "شناسه ی نظر معتبر نیست",
      });
    }

    const comment = await commentModel.findOne({ _id: id } as any);
    if (!comment) {
      return res.status(400).json({
        success: false,
        title: "شناسه ی نامعتبر",
        messages: "نظری با این شناسه یافت نشد",
      });
    }

    const productId = comment.product;

    // بروزرسانی وضعیت نمایش
    await commentModel.findByIdAndUpdate(
      id as any,
      { isShow: !comment.isShow },
      { returnDocument: "after" } as any,
    );

    // محاسبه میانگین امتیاز
    const allProductComments = await commentModel.find({
      $and: [{ product: productId }, { isShow: true }],
    } as any);

    // اگر هیچ کامنت نمایش‌داده‌شده‌ای وجود نداشت، امتیاز صفر
    const avg =
      allProductComments.length > 0
        ? allProductComments.reduce((acc, c) => acc + c.star, 0) /
          allProductComments.length
        : 0;

    await productModel.findOneAndUpdate(
      { _id: productId } as any,
      { rate: avg },
      { returnDocument: "after" } as any,
    );

    return res.json({
      success: true,
      title: "اطلاعات بروز شد",
      messages: "وضعیت نمایش نظر با موفقیت تغییر کرد",
    });
  } catch (err) {
    log("error in update comment api =>", err);
    return res.status(500).json({
      success: false, // اصلاح شد
      title: "خطای سرور",
      messages: "سرور به خطایی دور از انتظار مواجه شده مدتی بعد تلاش نمایید",
    });
  }
};