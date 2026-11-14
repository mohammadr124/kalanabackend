import type { Request, Response } from "express";
import connectToDb from "../funcs/connection.js";
import productModel from "../models/product.js";
import cardModel from "../models/card.js";
import orderModel from "../models/order.js";
import commentModel from "../models/comment.js";

const charecter = "abcdefghijklmnopqrstuvwxyz";
const numbers = "1234567890";

const keyGen = () => {
  let char = "";
  let num = "";
  let id = "";
  for (let i = 0; i <= 5; i++) {
    char = char + charecter[Math.floor(Math.random() * charecter.length)];
    num = num + numbers[Math.floor(Math.random() * numbers.length)];
  }
  const finaltext = char + num;

  for (let i = 0; i <= 5; i++) {
    id = id + finaltext[Math.floor(Math.random() * finaltext.length)];
  }
  return `#${id}`;
};

export const createorder = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const {
      productIds,
      items,
      userId,
      receiverName,
      receiverLastName,
      receiverPhone,
      receiverAddress,
      receiverCityAddress,
      receiverMainAddress,
      postCode,
      plaque,
      price,
      description,
    } = req.body;

    await Promise.all(
      productIds.map((id: string, i: number) =>
        productModel.findOneAndUpdate(
          {
            _id: id,
            count: { $gte: items[i].count },
          } as any,
          {
            $inc: { count: -items[i].count },
          },
          { new: true } as any,
        ),
      ),
    );

    await cardModel.deleteMany({
      user: userId,
    });

    const orderId = keyGen();

    await orderModel.create({
      receiverName: receiverName,
      receiverLastName: receiverLastName,
      receiverPhone: receiverPhone,
      receiverAddress: receiverAddress,
      receiverCityAddress: receiverCityAddress,
      receiverMainAddress: receiverMainAddress,
      postCode: postCode,
      plaque: plaque,
      description: description,
      orderPrice: price,
      orderOwner: userId,
      items: items,
      orderId: orderId,
    });

    return res.status(201).json({
      success: true,
      title: "عملیات موفقیت آمیز",
      messages: `سفارش شما با موفقیت ثبت شد`,
    });
  } catch (err) {
    console.log("error in create order api ====>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "سرور به مشکل خورده مدتی بعد تلاش نمایید",
    });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    const role = res.locals.userRole;
    const { id } = req.query;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        title: "اطلاعات نا معتبر",
        messages: "شناسه ای ارسال شده نامعتبر است",
      });
    }

    const count = 20;
    const skip = (+id - 1) * count;

    if (role !== "ADMIN") {
      const orders = await orderModel
        .find({ orderOwner: res.locals.userId } as any)
        .populate({ path: "orderOwner", select: "name lastName -_id" })
        .limit(count)
        .skip(skip)
        .sort({ createdAt: -1 });

      const userId = res.locals.userId;

      const orderCount = await orderModel.countDocuments({
        orderOwner: userId,
      });

      const processingOrder = await orderModel.countDocuments({
        $and: [{ orderOwner: userId }, { shippingStatus: "PROCESSING" }],
      });

      const deliveredOrders = await orderModel.countDocuments({
        $and: [{ orderOwner: userId }, { shippingStatus: "DELIVERED" }],
      });

      const waitingPaymentOrder = await orderModel.countDocuments({
        $and: [{ orderOwner: userId }, { paymentStatus: "PENDING" }],
      });

      return res.json({
        success: true,
        title: "اطلاعات با موفقیت ارسال شد",
        messages: "اطلاعات با موفقیت ارسال شد",
        data: {
          orders,
          orderCount,
          processingOrder,
          deliveredOrders,
          waitingPaymentOrder,
        },
      });
    }

    const orders = await orderModel
      .find({} as any)
      .populate({ path: "orderOwner", select: "name lastName -_id" })
      .limit(count)
      .skip(skip)
      .sort({ createdAt: -1 });

    const orderCount = await orderModel.countDocuments({});

    const processingOrder = await orderModel.countDocuments({
      shippingStatus: "PROCESSING",
    } as any);

    const deliveredOrders = await orderModel.countDocuments({
      shippingStatus: "DELIVERED",
    } as any);

    const waitingPaymentOrder = await orderModel.countDocuments({
      paymentStatus: "PENDING",
    } as any);

    return res.json({
      success: true,
      title: "اطلاعات با موفقیت ارسال شد",
      messages: "اطلاعات با موفقیت ارسال شد",
      data: {
        orders,
        orderCount,
        processingOrder,
        deliveredOrders,
        waitingPaymentOrder,
      },
    });
  } catch (err) {}
};

export const updatePayment = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    await orderModel.findOneAndUpdate(
      { _id: res.locals.orederId } as any,
      {
        shippingStatus: "PROCESSING",
        paymentStatus: "PAID",
      },
      { new: true } as any,
    );

    return res.json({
      success: false,
      title: "سفارش شما با موفقیت بروز شد",
      messages:
        "در صورت تحویل گرفتن کالای  خود وضیعت شفارش را به تحویل داده شده تغییر دهید",
    });
  } catch (err) {
    console.log("error is change order pay status middleware ====>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "سرور به مشکل خورده مدتی بعد تلاش نمایید",
    });
  }
};

export const updateShoppingStatus = async (req: Request, res: Response) => {
  await connectToDb();
  try {
    await orderModel.findOneAndUpdate(
      { _id: res.locals.orederId } as any,
      {
        shippingStatus: "DELIVERED",
      },
      { new: true } as any,
    );

    return res.json({
      success: false,
      title: "سفارش شما با موفقیت بروز شد",
      messages:
        "در صورت تحویل گرفتن کالای  خود وضیعت شفارش را به تحویل داده شده تغییر دهید",
    });
  } catch (err) {
    console.log("error is change order shopping status middleware ====>", err);
    return res.status(500).json({
      success: false,
      title: "خطای سرور",
      messages: "سرور به مشکل خورده مدتی بعد تلاش نمایید",
    });
  }
};
