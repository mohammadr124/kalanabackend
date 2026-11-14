import type { Request, Response } from "express";
import connectToDb from "../funcs/connection.js";
import productModel from "../models/product.js";
import { isValidObjectId } from "mongoose";
import commentModel from "../models/comment.js";

export const createProducyFunc = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const {
      title,
      category,
      brand,
      atributes,
      price,
      count,
      intro,
      productAtribute,
    } = req.body;
    const files = req.files as any;

    const base64Images = files.map((file: any) => {
      const buffer = file.buffer;
      const str = buffer.toString("base64");
      const mimeType = file.mimetype;
      const finalImage = `data:${mimeType};base64,${str}`;
      return finalImage;
    });

    await productModel.create({
      title,
      category,
      brand,
      atributes,
      price,
      count,
      intro,
      productAtribute,
      images: base64Images,
      rate: 0
    });
    return res.status(201).json({
      success: true,
      title: "عملیات موفقیت آمیز",
      messages: "محصول شما با موفقیت ایجاد شد",
    });
  } catch (err) {
    console.log("err in create product api =>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "سرور به مشکل برخورده مدتی بعد تلاش نمایید",
    });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({
        success: false,
        title: "درخواست نامعتبر به سرور",
        messages: "لطفا id را ارسال نمایید",
      });
    }

    const dataCount = 20;
    const skip = (+id - 1) * dataCount;

    const products = await productModel
      .find()
      .skip(skip)
      .limit(dataCount)
      .sort({ createdAt: -1 });

      const productCount = await productModel.countDocuments()

    return res.json({
      success: false,
      title: "عملیات موفقیت آمیز",
      messages: "محصول ها با مئفقیت از سرور گرقته شد",
      data: {
        products: products,
        productCount
      },
    });
  } catch (err) {
    console.log("error in get all product API ====> ", err);
    return res.status(500).json({
      success: false,
      title: "خطا داخلی سرور",
      messages: "سرور با مشکلی غیرمنتظره رو به رو شده، مدتی بعد تلاش نمایید",
    });
  }
};

export const getOneProduct = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const { id } = req.params;
    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        title: "شناسه نامعتبر",
        messages: "لطفا شناسه معتبر را ارسال کنید",
      });
    }

    const product = await productModel
      .findOne({ _id: id } as any)
      .populate("brand")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        title: "شناسه نامعتبر",
        messages: "محصولی با این شناسه یافت نشد",
      });
    }


    const comments = await commentModel.find({$and: [
      {product: id}, {isShow: true}
    ]} as any, "-__v").populate({path: "author",  select: "name lastName _id"} ).lean()

    product.comments = comments

    if (!product) {
      return res.status(404).json({
        success: false,
        title: "محصول یافت نشد",
        messages: "محصولی با این شناسه یافت نشد",
      });
    }

    return res.json({
      success: true,
      title: "عملیات موفقیت آمیز",
      messages: "اطلاعات محصواب با موفقیت برای شما ارسال شد",
      data: {
        product,
      },
    });
  } catch (err) {
    console.log("error in get one  product API ====> ", err);
    return res.status(500).json({
      success: false,
      title: "خطا داخلی سرور",
      messages: "سرور با مشکلی غیرمنتظره رو به رو شده، مدتی بعد تلاش نمایید",
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        title: "درخواست نامعتبر به سرور",
        messages: "لطفا id را ارسال نمایید",
      });
    }

    const product = await productModel.findOneAndDelete({ _id: id } as any);

    if (!product) {
      return res.status(404).json({
        success: false,
        title: "محصولی پیدا نشد",
        messages: "محصولی با این شناسه یافت نشد",
      });
    }

    return res.json({
      success: true,
      title: "عملیات موفقیت آمیز",
      messages: "محصول با موفقیت حذف شد",
    });
  } catch (err) {
    console.log("error in delete product apoi ====>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "سرور به مشکل خورده مدتی بعد تلاش نمایید",
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const { id } = req.params;

    const {
      title,
      category,
      intro,
      atributes,
      brand,
      price,
      productAtribute,
      count,
    } = req.body;

    await productModel.findOneAndUpdate(
      { _id: id } as any,
      {
        title,
        category,
        intro,
        atributes,
        brand,
        price,
        productAtribute,
        count,
      },
      { new: true } as any,
    );

    res.json({
      success: true,
      title: "محصول با موفقیت بروز شد",
      messages: "اطلاعات محصول با موفقیت بروز شد",
    });
  } catch (err) {
    console.log("error in update product api ====>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "سرور به مشکل خورده مدتی بعد تلاش نمایید",
    });
  }
};
