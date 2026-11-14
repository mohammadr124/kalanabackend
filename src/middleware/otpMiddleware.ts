import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../funcs/token.js";
import { validationResult } from "express-validator";

export const isAccessForSendOtpCode = (
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

  const authToken = req.cookies.auth_token;

  if (authToken) {
    const tokenInfo: any = verifyToken(authToken);
    if (tokenInfo.email) {
      return res.status(401).json({
        success: false,
        title: "عدم دسترسی",
        messages: "شما از قبل ثبت نام کرده اید و به این api دسترسی ندارید",
      });
    }
  }
  next()
};

