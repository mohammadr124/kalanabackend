import express from "express";
import helmet from "helmet";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import otpRouter from "./router/otp.js";
import ticketRouter from "./router/ticket.js";
import { createServer } from "http";
import { Server } from "socket.io";
import ticketMessageSocket from "./router/ticketMessage.js";
import brandRouter from "./router/brand.js";
import { multerErrorHandler } from "./middleware/multer.js";
import userRoute from "./router/user.js";
import producRouter from "./router/product.js";
import commentRouter from "./router/comment.js";
import cardRouter from "./router/card.js";
import orderRouter from "./router/order.js";

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", ""],
    credentials: true,
  }),
);
app.use(morgan("dev"));

app.use("/api/user", userRoute);
app.use("/api/otp-code", otpRouter);
app.use("/api/ticket", ticketRouter);
app.use("/api/brand", brandRouter);
app.use("/api/product", producRouter);
app.use("/api/comment", commentRouter);
app.use("/api/card", cardRouter);
app.use("/api/order", orderRouter);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", ""],
    credentials: true,
  },
});

ticketMessageSocket(io);

app.use(multerErrorHandler);
const port: string | undefined = process.env.PORT;
httpServer.listen(port && Number(port), () => {
  console.log(`server ran to port ===> ${port} `);
});
