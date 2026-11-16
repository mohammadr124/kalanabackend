import connectToDb from "../funcs/connection.js";
import type { Request, Response } from "express";
import userModel from "../models/user.js";
import { tokenGenerator, verifyToken } from "../funcs/token.js";
import { hashPassword, verifyPassword } from "../funcs/password.js";
import type { JwtPayload } from "jsonwebtoken";
import { validationResult } from "express-validator";
import { isValidObjectId } from "mongoose";

export const registerFunc = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const { name, lastName, phone, email, password } = req.body;
    const isExsitUser = await userModel.findOne({
      $or: [{ email }, { phone }],
    } as any);

    if (isExsitUser) {
      return res.status(403).json({
        success: false,
        title: "کاربر با این اطلاعات وجود دارد",
        messages:
          "کاربری بااین اطلاعات وجود دارد باید از اطلاعات دیگری استفاده کنید",
      });
    }

    const token = tokenGenerator(email);
    const newPassword = await hashPassword(password);

    const usersCount = await userModel.countDocuments();

    res.cookie("auth_token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "none" as const,
      secure: true,
      path: "/",
    });

    await userModel.create({
      name,
      lastName,
      phone,
      email,
      password: newPassword,
      role: usersCount === 0 ? "ADMIN" : "USER",
    });
    res.status(201).json({
      success: true,
      title: "ثبت نام موقفیت آمیز",
      messages: "ثبت نام با موفقیت انجام شد",
    });
  } catch (error) {
    console.log("error in register api ====>", error);
    return res.status(500).json({
      success: false,
      title: "خطای داخلی سرور",
      messages: "سرور به مشکل مدتی بعد مجددا تلاش نمایید",
    });
  }
};

export const loginFunc = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const { email, password } = req.body;
    const findUser = await userModel.findOne({ email } as any);
    if (!findUser) {
      return res.status(404).json({
        success: false,
        title: "ایمیل نامعتبر",
        messages: "کاربری با این ایمیل یافت نشد",
      });
    }

    if (findUser.isBan) {
      return res.status(403).json({
        success: false,
        title: "کاربر بن شده",
        messages: "شما به دلیل بن شدن دسترسی ندارید",
      });
    }

    const isValidPassword = await verifyPassword(password, findUser.password);

    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        title: "رمز عبور نامعتبر",
        messages: "رمز عبور وارد شده صحیح نمی باشد",
      });
    }

    const token = tokenGenerator(email);

    res.cookie("auth_token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "none" as const,
      secure: true,
      path: "/",
    });

    res.json({
      success: true,
      title: "ورود موفقیت آمیز",
      messages: "ورود شما موفقیت آمیز بود",
    });
  } catch (error) {
    console.log("errpr in login api ====>", error);
    return res.status(500).json({
      success: false,
      title: "خطای داخلی سرور",
      messages: "سرور به مشکل مدتی بعد مجددا تلاش نمایید",
    });
  }
};

export const logoutFunc = (req: Request, res: Response) => {
  const token = tokenGenerator("testEmail");
  res.cookie("auth_token", token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: "none" as const,
    secure: true,
    path: "/",
  });

  res.status(200).json({
    success: true,
    title: "عملیات موفقیت آمیز",
    messages: "شما با موفقت از حساب خود خارج شدید",
  });
};

export const getmeFunc = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const authToken = req.cookies.auth_token;
    const tokenInfo: string | JwtPayload | undefined | any =
      verifyToken(authToken);
    const email = tokenInfo.email;
    const findUser = await userModel.findOne({ email } as any, "-__v ");

    if (findUser.isBan) {
      return res.status(403).json({
        success: false,
        title: "کاربر بن شده",
        messages: "شما به دلیل بن شدن دسترسی ندارید",
      });
    }

    res.json(findUser);
  } catch (error) {
    console.log("errpr in get me api ====>", error);
    return res.status(500).json({
      success: false,
      title: "خطای داخلی سرور",
      messages: "سرور به مشکل مدتی بعد مجددا تلاش نمایید",
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      const errors = result.array();
      return res.status(400).json({
        success: false,
        title: "درخواست بد به سرور",
        messages: errors,
      });
    }
    const { password, phone } = req.body;

    const newPassword = await hashPassword(password);

    const user = await userModel.findOne({ phone } as any);

    if (user.isBan) {
      return res.status(403).json({
        success: false,
        title: "کاربر بن شده",
        messages: "شما به دلیل بن شدن دسترسی ندارید",
      });
    }

    const findUser = await userModel.findOneAndUpdate(
      { phone } as any,
      { password: newPassword } as any,
      { new: true } as any,
    );

    if (!findUser) {
      return res.status(404).json({
        success: false,
        title: "کاربری با این اطلاعات یافت نشد",
        messages:
          "کاربری یا این اطلاعات یافت نشد از شماره موبایل دیگری استفاده کنید یا درصورت نداشتن حساب ابتدا  حساب کاربری خود را ایجاد کنید",
      });
    }

    res.status(200).json({
      success: true,
      title: "زمر عبور با موفقیت عوض شد",
      messages: "رمز عبور شما با موفقیت تغییر  کرد",
    });
  } catch (error) {
    console.log("errpr in change password api ====>", error);
    return res.status(500).json({
      success: false,
      title: "خطای داخلی سرور",
      messages: "سرور به مشکل مدتی بعد مجددا تلاش نمایید",
    });
  }
};

export const allUserFunc = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({
        success: false,
        title: "اطلاعات نامعتبر",
        messages: "شما باید id رو ارسال کنید",
      });
    }

    const dataCount = 40;
    const skip = (+id - 1) * dataCount;

    const users = await userModel
      .find()
      .limit(dataCount)
      .skip(skip)
      .sort({ createdAt: -1 });

    const [banUserCount, activeUserCount, adminsCount, userCount] =
      await Promise.all([
        userModel.countDocuments({ isBan: true }),
        userModel.countDocuments({ isBan: false }),
        userModel.countDocuments({ role: "ADMIN" }),
        userModel.countDocuments({}),
      ]);

    return res.json({
      success: true,
      title: "عملیات موفقیت‌آمیز",
      messages: "اطلاعات کاربران با موفقیت به سمت شما ارسال شد",
      data: {
        users,
        banUserCount,
        activeUserCount,
        adminsCount,
        userCount,
      },
    });
  } catch (err) {
    console.log("error in get all user api ==> ", err);
    return res.status(500).json({
      success: false,
      title: "خطای داخلی سرور",
      messages: "سرور به مشکل مدتی بعد مجددا تلاش نمایید",
    });
  }
};

export const banUser = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        title: "شناسه نامعتبر",
        messages: "شناسه ی ارسال شده معتبر نیست",
      });
    }

    const user = await userModel.findOne({ _id: id } as any);

    if (!user) {
      return res.status(404).json({
        success: false,
        title: "شناسه نامعتبر",
        messages: "کاربری با این شناسه یافت نشد",
      });
    }

    if (user.role === "ADMIN") {
      return res.status(403).json({
        success: true,
        title: "درخواست نامعتبر",
        messages: "امکان مسدود کردن مدیران وجود ندارد",
      });
    }

    if (user.isBan) {
      await userModel.findOneAndUpdate({ _id: id } as any, { isBan: false }, {
        new: true,
      } as any);
      return res.status(200).json({
        success: true,
        title: "عملیات موفقبت آمیز",
        messages: "اطلاعات کاربر با موفقیت بروز  رسانی شد",
      });
    }

    await userModel.findOneAndUpdate({ _id: id } as any, { isBan: true }, {
      new: true,
    } as any);
    return res.status(200).json({
      success: true,
      title: "عملیات موفقبت آمیز",
      messages: "اطلاعات کاربر با موفقیت بروز  رسانی شد",
    });
  } catch (err) {
    console.log("error in ban  user API =====> ", err);
    return res.status(500).json({
      success: false,
      title: "خطای داخلی سرور",
      messages: "سرور به مشکل مدتی بعد مجددا تلاش نمایید",
    });
  }
};

export const createAdminUser = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const { id } = req.params;
    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        title: "اطلاعات نا معتبر",
        messages: "شناسه ارسال شده صحیح نمی باشد",
      });
    }

    const user = await userModel.findOne({ _id: id } as any);
    const role = user.role;

    if (role === "ADMIN") {
      return res.status(403).json({
        success: false,
        title: "درخواست نامعتبر",
        message:
          "این کاربر در حال حاضر دارای بالاترین سطح دسترسی (مدیر) است و امکان ارتقای نقش برای او وجود ندارد.",
      });
    }

    await userModel.findOneAndUpdate(
      { _id: id } as any,
      { role: "ADMIN" } as any,
      { new: true } as any,
    );

    return res.status(200).json({
      success: true,
      title: "عملیات موفقیت آمیز",
      message: "اطلاعات کاربر مورد نطر با موفقیت بروزرسانی شد",
    });
  } catch (err) {
    console.log("error in create admin api ====>", err);
    return res.status(500).json({
      success: false,
      title: "خطای داخلی سرور",
      messages: "سرور به مشکل مدتی بعد مجددا تلاش نمایید",
    });
  }
};

export const updateInfoFunc = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const { name, lastName, email } = req.body;
    const authToken = req.cookies.auth_token;
    const tokenInfo: any = verifyToken(authToken);
    const userEmail = tokenInfo.email;

    if (email !== userEmail) {
      const newToken = tokenGenerator(email);
      if (!newToken) {
        return res.status(500).json({
          success: false,
          title: "خطا در ایجاد توکن",
          messages: "ساختن توکن با شکیت مواجه شد",
        });
      }

      res.cookie("auth_token", newToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: "strict",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });

      await userModel.findOneAndUpdate(
        { email: userEmail } as any,
        {
          name,
          lastName,
          email,
        } as any,
        {
          new: true,
        } as any,
      );

      return res.json({
        success: true,
        title: "عملیات موفقیت آمیز",
        messages: "اطلاعات کابر با موفقیت بروز شد",
      });
    }

    await userModel.findOneAndUpdate(
      { email: userEmail } as any,
      {
        name,
        lastName,
      } as any,
      {
        new: true,
      } as any,
    );
    return res.json({
      success: true,
      title: "عملیات موفقیت آمیز",
      messages: "اطلاعات کابر با موفقیت بروز شد",
    });
  } catch (err) {
    console.log("error in update userinfo ==> ", err);
    return res.status(500).json({
      success: false,
      title: "خطای داخلی سرور",
      messages: "سرور به مشکل مدتی بعد مجددا تلاش نمایید",
    });
  }
};
