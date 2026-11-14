import type { Request, Response } from "express";
import connectToDb from "../funcs/connection.js";
import brandModel from "../models/brand.js";

export const createBrandFunc = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const brandName = req.body.name;
    const brandDescription = req.body.description;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        title: "درخواست نامعتبر به سرور",
        messages: "عکس ارسال شده نامعتبر است",
      });
    }

    const buffer = file.buffer;
    const str = buffer.toString("base64");
    const mimeType = file.mimetype;
    const finalImage = `data:${mimeType};base64,${str}`;

   await brandModel.create({
    barndName: brandName,
    barndDescription: brandDescription,
    barndImageUrl: finalImage,
    isActive: true
   })

    return res.status(201).json({
      success: true,
      title: "عملیات موفقیت آمیز",
      messages: "برند با موفقیت ایجاد شد",
    });
  } catch (error) {
    console.log("error in create brand API ====> ", error);
    return res.status(500).json({
      success: false,
      title: "خطا داخلی سرور",
      messages: "سرور با مشکلی غیرمنتظره رو به رو شده، مدتی بعد تلاش نمایید",
    });
  }
};

export const getBrand = async (req: Request, res: Response) => {
  await connectToDb()
  try {
    const { id } = req.query;

    const showDataCount = 40;
    const skip = (Number(id) - 1) * showDataCount;

    const brands = await brandModel
      .find({} as any, "-__v")
      .limit(showDataCount)
      .skip(skip)
      .sort({ createdAt: -1 });

    const activeCount = await brandModel.countDocuments({
      isActive: true,
    } as any);

    const brandCount = await brandModel.countDocuments({}as any)

     return res.json({
      success: true,
      title: "عمیلات موفقیت آمیز",
      messages: "اطلاعات با موفیت به سمت شما ارسال شد",
      data: {
        brands,
        activeBrandCount:  activeCount,   
        unActiveBrandCount: brandCount - activeCount, 
        allBrandCount: brandCount
      }
    });
  } catch (err) {
    console.log("error in access get brand API ====>", err);
    return res.status(500).json({
      success: false,
      title: "خطای داخلی سرور ",
      messages: "خطایی داخلی سرور مدتی بعد تلاش نمایید",
    });
  }
}

export const deleteBrand = async (req: Request, res: Response) => {
  await connectToDb()
  try {
    const { id } = req.params

    const brand = await brandModel.findOneAndDelete({_id: id} as any)

    if(!brand) {
      return res.status(404).json({
        success: false,
        title: "not found",
        messages: "برندی با این اطلاعات یافت نشد",
      });
    } 
    res.json({
      success: true,
      title: "عملیات با موفقیت انجام شد",
      messages: "برند مورد نظر با موفقیت حذف شد",
    });
  } catch (err) {
    console.log("error in del brand API => ",err);
    return res.status(500).json({
      success: false,
      title: "خطا ی داخلی سرور",
      messages: "سرور به مشکب خورده مدتی بعد تلاش نمایید",
    });
  } 
}

export const updateFunc = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const { id } = req.params;

    const brandName: string = req.body.barndName;
    const brandDescription: string = req.body.barndDescription;
    const file = req.file;
    const isActive = req.body["is-active"];

    if (!file) {
      await brandModel.findOneAndUpdate(
        { _id: id } as any,
        {
          barndName: brandName,
          barndDescription: brandDescription,
          isActive: isActive === "on" ? true : false,
        },
        { new: true } as any,
      );

      return res.json({
        success: false,
        title: "اطلاهات بروز شد",
        messages: "اطلاعات برند شما بروز رسانی شد",
      });
    }

    const buffer = file.buffer;
    const str = buffer.toString("base64");
    const mimeType = file.mimetype;
    const finalImage = `data:${mimeType};base64,${str}`;

    await brandModel.findOneAndUpdate(
      { _id: id } as any,
      {
        barndName: brandName,
        barndDescription: brandDescription,
        barndImageUrl: finalImage,
        isActive: isActive === "on" ? true : false,
      },
      { new: true } as any,
    );

    return res.json({
      success: false,
      title: "اطلاهات بروز شد",
      messages: "اطلاعات برند شما بروز رسانی شد",
    });
  } catch (err) {
    console.log("error in  update brand api ====>", err);
    return res.status(500).json({
      success: false,
      title: "خطای داخلی سرور ",
      messages: "خطایی داخلی سرور مدتی بعد تلاش نمایید",
    });
  }
}