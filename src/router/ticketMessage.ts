import { isValidObjectId } from "mongoose";
import type { Server, Socket } from "socket.io";
import ticketModel from "../models/ticket.js";
import connectToDb from "../funcs/connection.js";
import ticketMessageModel from "../models/ticketMessage.js";
import userModel from "../models/user.js";

const ticketMessageSocket = (io: Server) => {
  io.on("connection", async (socket: Socket) => {
    await connectToDb();

    socket.on("message", async (data) => {
      try {
        const id = data?.id;

        if (!id || !isValidObjectId(id)) {
          socket.emit(
            "message",
            JSON.stringify({
              success: false,
              title: "شناسه نامعتبر",
              messages: "شناسه نامعتبر لطفا از شناسه معتبری استفاده کنید",
            }),
          );
          return;
        }

        const roomName = `ticket:${id}`;
        socket.join(roomName);

        const ticket = await ticketModel.findOne({ _id: id } as any, "-__v");

        if (!ticket) {
          socket.emit(
            "message",
            JSON.stringify({
              success: false,
              title: "تیکتی یافت نشد",
              messages: "تیکتی با این شناسه یافت نشد",
            }),
          );
          return;
        }

        const ticketMessage = await ticketMessageModel
          .find({ ticket: ticket._id } as any, "-__v")
          .populate("author", "-__v");

        socket.emit(
          "message",
          JSON.stringify({
            success: true,
            title: "عملیات موفق",
            messages: "دیتا با موفقیت از سرور گرفته شد",
            data: {
              ticket: ticket,
              message: ticketMessage,
            },
          }),
        );
      } catch (error) {
        console.log("error in ticket socket api ====>", error);
        socket.emit(
          "message",
          JSON.stringify({
            success: false,
            title: "خطای ناخواسته",
            messages: "خطایی ناخواسته به وجود آمده مدتی بعد تلاش نمایید",
          }),
        );
      }
    });

    socket.on("create-message", async (data) => {
      try {
        const { text, id, authorId } = data || {};

        if (!text || !id || !authorId) {
          socket.emit(
            "message",
            JSON.stringify({
              success: false,
              title: "ورودی های نامعتبر",
              messages: "تمامی فیلد ها را پر کنید زیرا این فیلد ها الزامی است",
            }),
          );
          return;
        }

        if (!isValidObjectId(id) || !isValidObjectId(authorId)) {
          socket.emit(
            "message",
            JSON.stringify({
              success: false,
              title: "شناسه نامعتبر",
              messages: "شناسه وارد شده معتبر نیست",
            }),
          );
          return;
        }

        const roomId = `ticket:${id}`;
        socket.join(roomId);

        const user = await userModel.findOne({ _id: authorId } as any);

        if (!user) {
          socket.emit(
            "message",
            JSON.stringify({
              success: false,
              title: "کاربری یافت نشد",
              messages: "کاربری با این شناسه یافت نشد",
            }),
          );
          return;
        }

        await ticketMessageModel.create({
          author: authorId,
          messageBody: text,
          ticket: id,
        } as any);

        const messages = await ticketMessageModel
          .find({ ticket: id } as any)
          .populate("author", "-__v")
          .lean();

        const statusTicket =
          user.role === "ADMIN" ? "پاسخ داده شده" : "در حال بررسی";

        const freshTicket = await ticketModel.findOneAndUpdate(
          { _id: id } as any,
          { status: statusTicket, lastUpdate: Date.now() } as any,
          { new: true } as any,
        );

        io.to(roomId).emit(
          "message",
          JSON.stringify({
            success: true,
            title: "عملیات موفق",
            messages: "دیتا با موفقیت از سرور گرفته شد",
            data: {
              ticket: freshTicket,
              message: messages,
            },
          }),
        );
      } catch (error) {
        console.log("error in create message socket api ====>", error);
        socket.emit(
          "message",
          JSON.stringify({
            success: false,
            title: "خطای ناخواسته",
            messages: "خطایی ناخواسته به وجود آمده مدتی بعد تلاش نمایید",
          }),
        );
      }
    });
  });
};

export default ticketMessageSocket;
