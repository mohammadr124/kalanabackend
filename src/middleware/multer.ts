import multer from "multer";
import type { Request, Response, NextFunction } from "express";

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024,
  },
});

export const multerErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          title: "فایل خیلی بزرگ است",
          messages: "حجم عکس نباید بیشتر از ۱ مگابایت باشد",
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          title: "تعداد فایل زیاد است",
          messages: "فقط می‌توانید یک فایل ارسال کنید",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          title: "فیلد غیرمنتظره",
          messages: `فیلد «${err.field}» مجاز نیست`,
        });
      default:
        return res.status(400).json({
          success: false,
          title: "خطای آپلود",
          messages: err.message,
        });
    }
  }

  if (err && err.message === "فرمت فایل مجاز نیست") {
    return res.status(400).json({
      success: false,
      title: "فرمت نامعتبر",
      messages: "فقط JPG، PNG و WEBP مجاز است",
    });
  }

  next(err);
};

export default uploader