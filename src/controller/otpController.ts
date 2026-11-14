import type { Request, Response } from "express";
import connectToDb from "../funcs/connection.js";
import otpModel from "../models/otp.js";
import userModel from "../models/user.js";

export const sendOtpCode = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const { phone } = req.body;
    const otpCode = Math.floor(Math.random() * 99_999);

    const smsResponse = await fetch(
      `${process.env.SMS_BASE_URL}/ws/v1/sms/pattern`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Api-Key": `${process.env.SMS_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "tnxOcKXUXU",
          attributes: {
            code: otpCode,
          },
          recipient: phone,
          line_number: "50002178584000",
          number_format: "english",
        }),
      },
    );

    if (!smsResponse.ok) {
      return res.status(smsResponse.status).json({
        success: false,
        title: "خطا در ارسال کد",
        messages: "کد پبامکی به شماره موباید شماارسال نشد",
      });
    }

    const now = Date.now();
    const expTime = now + 1000 * 60 * 2;

    await otpModel.create({ code: otpCode, phone, expTime } as any);

    res.json({
      success: true,
      title: "کد پیامکی ارسال شد",
      messages: "کد پبامکی شما با موفقیت ارسال شد ",
    });
  } catch (error) {
    console.log("error in send otp code ====>", error);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "سرور به خطا خورد مدتی بعد مجددا تلاش نمایید",
    });
  }
};

export const verifyOtpCoede = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const secretToken = crypto.randomUUID();

    const { phone, code } = req.body;
    if (!Math.floor(code / 10_000)) {
      return res.status(400).json({
        success: false,
        title: "کد ارسال شده نامعتبر است",
        messages: "کد شما باید پنج رقمی باشد",
      });
    }

    const findOtpCode = await otpModel.findOne({
      $and: [{ phone }, { code }],
    } as any);
    if (!findOtpCode) {
      return res.status(400).json({
        success: false,
        title: "کدوارد شده وجود ندارد",
        messages: "چنین کدی وجود ندارد لطفا مجددا تلاش نمایید",
      });
    }

    const now = Date.now();
    const expTime = findOtpCode.expTime;
    if (expTime < now) {
      return res.status(410).json({
        success: false,
        title: "کد منقضی شده",
        messages: "کد ورود شما منقضی شده",
      });
    }

    const findUser = await userModel.findOneAndUpdate(
      { phone } as any,
      {
        resetToken: secretToken,
        resetTokenexpTime: Date.now() + 1000 * 60 * 10,
      },
      { new: true } as any,
    );

    res.status(200).json({
      success: true,
      title: "کد ورود صحیح",
      messages: "کد ورود شما صحیح است",
      data: [
        {
          secretToken: secretToken,
        },
      ],
    });
  } catch (error) {
    console.log("error in verify otp code ====>", error);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "سرور به خطا خورد مدتی بعد مجددا تلاش نمایید",
    });
  }
};
