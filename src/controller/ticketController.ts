import type { Request, Response } from "express";
import connectToDb from "../funcs/connection.js";
import ticketModel from "../models/ticket.js";
import ticketMessageModel from "../models/ticketMessage.js";
import { verifyToken } from "../funcs/token.js";
import userModel from "../models/user.js";
import { log } from "console";

export const createTicketFunc = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const now = Date.now();
    const { title, department, ticketText } = req.body;

    const authToken = req.cookies.auth_token;
    const tokenInfo: any = verifyToken(authToken);
    const email = tokenInfo.email;
    const author = await userModel.findOne({ email } as any);

    if (!author) {
      return res.status(404).json({
        success: false,
        title: "کاربر یافت نشد",
        messages: "کاربری با این مشخصات یافت نشد",
      });
    }
    
    if(author.isBan) {
      return res.status(403).json({
        success: false,
        title: "کاربر بن شده",
        messages: "شما به دلیل بن شدن دسترسی ندارید",
      });
    }

    const newTicket = await ticketModel.create({
      title,
      department,
      author: author._id,
      lastUpdate: now,
      status: "در حال بررسی",
    });

    const ticketId = newTicket._id;

    const ticket = await ticketMessageModel.create({
      author: author._id,
      messageBody: ticketText,
      ticket: ticketId,   // ✅ فقط این خط: tiket → ticket
    });

    return res.status(201).json({
      success: true,
      title: "عملیات موفقیت آمیز ",
      messages: "تیکیت با موفقیت ثبت شد",
      data: {
        ticketId: ticket._id,
      },
    });
  } catch (error) {
    console.log("error create ticket api ====>", error);
    return res.status(500).json({
      success: false,
      title: "خطای سرور ",
      messages: "خطای داخلی سرور ",
    });
  }
};

export const myTicketFunc = async (req: Request, res: Response) => {
  await connectToDb();

  try {
    const ticketId = req.query.id;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        title: "ابتدا کوئری را ارسال کنید",
        messages: "ابتدا کوئری را ارسال کنید",
      });
    }

    const authToken = req.cookies.auth_token;

    if (!authToken) {
      return res.status(401).json({
        success: false,
        title: "عدم دسترسی",
        messages:
          "ابتدا وارد حساب کاربری خود شوید و درصورت نداشتن حساب در وب سایت ثبت نام کنید",
      });
    }

    const tokenInfo: any = verifyToken(authToken);

    if (tokenInfo) {
      if (!tokenInfo.email) {
        return res.status(401).json({
          success: false,
          title: "عدم دسترسی",
          messages:
            "ابتدا وارد حساب کاربری خود شوید و درصورت نداشتن حساب در وب سایت ثبت نام کنید",
        });
      }
    }

    const user = await userModel.findOne({
      email: tokenInfo?.email,
    } as any);

    if (!user) {
      return res.status(404).json({
        success: false,
        title: "کاربری یافت نشد",
        messages: "با این اطلاعات کاربری یافت نشد",
      });
    }


    if(user.isBan) {
      return res.status(403).json({
        success: false,
        title: "کاربر بن شده",
        messages: "شما به دلیل بن شدن دسترسی ندارید",
      });
    }


    const role = user.role;
    const count = 40;
    const skip = (Number(ticketId)-1) * count
    

    if (role === "ADMIN") {
      const tickets = await ticketModel
        .find({} as any, "-__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(count);

      return res.json({
        success: true,
        title: "عملیات موفقیت آمیز",
        data: tickets,
      });
    }

    const myTickets = await ticketModel
      .find(
        {
          author: user._id,
        } as any,
        "-__v",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(count);

    return res.json({
      success: true,
      title: "عملیات موفقیت آمیز",
      data: myTickets,
    });
  } catch (error) {
    console.log("error get my ticket api ====>", error);

    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "خطای داخلی سرور",
    });
  }
};

export const allTicketCount = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const authToken = req.cookies.auth_token;
    if (!authToken) {
      return res.status(401).json({
        success: false,
        title: "عدم دسترسی ",
        messages:
          "ایتدا وارد حساب کاربری خود شوید و درصورت نداشتن حساب در وب سایت ثبت نام کنید",
      });
    }

    const tokenInfo: any = verifyToken(authToken);
    if (tokenInfo) {
      if (!tokenInfo.email) {
        return res.status(401).json({
          success: false,
          title: "عدم دسترسی ",
          messages:
            "ایتدا وارد حساب کاربری خود شوید و درصورت نداشتن حساب در وب سایت ثبت نام کنید",
        });
      }
    }

    const user = await userModel.findOne({ email: tokenInfo?.email } as any);
    if (!user) {
      return res.status(40).json({
        success: false,
        title: "کاربری یافت نشد",
        messages: "با این اطلاعات کاربری یافت نشد",
      });
    }

    if(user.isBan) {
      return res.status(403).json({
        success: false,
        title: "کاربر بن شده",
        messages: "شما به دلیل بن شدن دسترسی ندارید",
      });
    }
    const role = user.role;

    if (role === "ADMIN") {
      const ticketsCount = await ticketModel.countDocuments({} as any);
      return res.json({
        success: true,
        title: "عملیات موفقیت آمیز",
        data: ticketsCount,
      });
    }

    const myTicketsCount = await ticketModel.countDocuments({
      author: user._id,
    } as any);
    return res.json({
      success: true,
      title: "عملیات موفقیت آمیز",
      data: myTicketsCount,
    });
  } catch (error) {
    console.log("error get my ticket api ====>", error);
    return res.status(500).json({
      success: false,
      title: "خطای سرور ",
      messages: "خطای داخلی سرور ",
    });
  }
};

export const pendingTicketCount = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const authToken = req.cookies.auth_token;
    if (!authToken) {
      return res.status(401).json({
        success: false,
        title: "عدم دسترسی ",
        messages:
          "ایتدا وارد حساب کاربری خود شوید و درصورت نداشتن حساب در وب سایت ثبت نام کنید",
      });
    }

    const tokenInfo: any = verifyToken(authToken);
    if (tokenInfo) {
      if (!tokenInfo.email) {
        return res.status(401).json({
          success: false,
          title: "عدم دسترسی ",
          messages:
            "ابتدا وارد حساب کاربری خود شوید و درصورت نداشتن حساب در وب سایت ثبت نام کنید",
        });
      }
    }

    const user = await userModel.findOne({ email: tokenInfo?.email } as any);
    if (!user) {
      return res.status(40).json({
        success: false,
        title: "کاربری یافت نشد",
        messages: "با این اطلاعات کاربری یافت نشد",
      });
    }

    if(user.isBan) {
      return res.status(403).json({
        success: false,
        title: "کاربر بن شده",
        messages: "شما به دلیل بن شدن دسترسی ندارید",
      });
    }

    const role = user.role;

    if (role === "ADMIN") {
      const tickets = await ticketModel.find({} as any);
      const pendingTicket = tickets.filter(
        (ticket) => ticket.status === "در حال بررسی",
      );
      return res.json({
        success: true,
        title: "عملیات موفقیت آمیز",
        data: pendingTicket.length,
      });
    }

    const myTickets = await ticketModel.find({
      author: user._id,
    } as any);
    const pendingTicket = myTickets.filter(
      (ticket) => ticket.status === "در حال بررسی",
    );

    return res.json({
      success: true,
      title: "عملیات موفقیت آمیز",
      data: pendingTicket.length,
    });
  } catch (error) {
    console.log("error get my ticket api ====>", error);
    return res.status(500).json({
      success: false,
      title: "خطای سرور ",
      messages: "خطای داخلی سرور ",
    });
  }
};

export const colsedTicketCount = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const authToken = req.cookies.auth_token;
    if (!authToken) {
      return res.status(401).json({
        success: false,
        title: "عدم دسترسی ",
        messages:
          "ایتدا وارد حساب کاربری خود شوید و درصورت نداشتن حساب در وب سایت ثبت نام کنید",
      });
    }

    const tokenInfo: any = verifyToken(authToken);
    if (tokenInfo) {
      if (!tokenInfo.email) {
        return res.status(401).json({
          success: false,
          title: "عدم دسترسی ",
          messages:
            "ابتدا وارد حساب کاربری خود شوید و درصورت نداشتن حساب در وب سایت ثبت نام کنید",
        });
      }
    }

    const user = await userModel.findOne({ email: tokenInfo?.email } as any);
    if (!user) {
      return res.status(40).json({
        success: false,
        title: "کاربری یافت نشد",
        messages: "با این اطلاعات کاربری یافت نشد",
      });
    }

    if(user.isBan) {
      return res.status(403).json({
        success: false,
        title: "کاربر بن شده",
        messages: "شما به دلیل بن شدن دسترسی ندارید",
      });
    }
    const role = user.role;

    if (role === "ADMIN") {
      const tickets = await ticketModel.find({} as any);
      const colsedTicket = tickets.filter(
        (ticket) => ticket.status === "بسته شده",
      );
      return res.json({
        success: true,
        title: "عملیات موفقیت آمیز",
        data: colsedTicket.length,
      });
    }

    const myTickets = await ticketModel.find({
      author: user._id,
    } as any);
    const colsedTicket = myTickets.filter(
      (ticket) => ticket.status === "بسته شده",
    );

    return res.json({
      success: true,
      title: "عملیات موفقیت آمیز",
      data: colsedTicket.length,
    });
  } catch (error) {
    console.log("error get my ticket api ====>", error);
    return res.status(500).json({
      success: false,
      title: "خطای سرور ",
      messages: "خطای داخلی سرور ",
    });
  }
};

export const answeredTicketCount = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const authToken = req.cookies.auth_token;
    if (!authToken) {
      return res.status(401).json({
        success: false,
        title: "عدم دسترسی ",
        messages:
          "ایتدا وارد حساب کاربری خود شوید و درصورت نداشتن حساب در وب سایت ثبت نام کنید",
      });
    }

    const tokenInfo: any = verifyToken(authToken);
    if (tokenInfo) {
      if (!tokenInfo.email) {
        return res.status(401).json({
          success: false,
          title: "عدم دسترسی ",
          messages:
            "ابتدا وارد حساب کاربری خود شوید و درصورت نداشتن حساب در وب سایت ثبت نام کنید",
        });
      }
    }

    const user = await userModel.findOne({ email: tokenInfo?.email } as any);
    if (!user) {
      return res.status(40).json({
        success: false,
        title: "کاربری یافت نشد",
        messages: "با این اطلاعات کاربری یافت نشد",
      });
    }

    if(user.isBan) {
      return res.status(403).json({
        success: false,
        title: "کاربر بن شده",
        messages: "شما به دلیل بن شدن دسترسی ندارید",
      });
    }
    
    const role = user.role;

    if (role === "ADMIN") {
      const tickets = await ticketModel.find({} as any);
      const colsedTicket = tickets.filter(
        (ticket) => ticket.status === "پاسخ داده شده",
      );
      return res.json({
        success: true,
        title: "عملیات موفقیت آمیز",
        data: colsedTicket.length,
      });
    }

    const myTickets = await ticketModel.find({
      author: user._id,
    } as any);
    const colsedTicket = myTickets.filter(
      (ticket) => ticket.status === "پاسخ داده شده",
    );

    return res.json({
      success: true,
      title: "عملیات موفقیت آمیز",
      data: colsedTicket.length,
    });
  } catch (error) {
    console.log("error get my ticket api ====>", error);
    return res.status(500).json({
      success: false,
      title: "خطای سرور ",
      messages: "خطای داخلی سرور ",
    });
  }
};
