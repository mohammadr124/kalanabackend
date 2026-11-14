import express from "express";
import { body } from "express-validator";
import { isAccessForCreateTicket } from "../middleware/ticketMiddleware.js";
import {
  allTicketCount,
  answeredTicketCount,
  colsedTicketCount,
  createTicketFunc,
  myTicketFunc,
  pendingTicketCount,
} from "../controller/ticketController.js";
const ticketRouter = express.Router();

ticketRouter.post(
  "/create-ticket",
  body("title")
    .trim()
    .notEmpty()
    .withMessage("موضوع تیکیت نباید خالی باشد")
    .bail()
    .isLength({ min: 10 })
    .withMessage("موضوع تیکت نباید کمتراز ده حرف باشد"),
  body("department")
    .trim()
    .notEmpty()
    .withMessage("دپارلمان تیکیت خود را حتما باید انتخاب کنید")
    .bail(),
  body("ticketText")
    .trim()
    .notEmpty()
    .withMessage("متن تیکت شما نباید خالی باشد")
    .bail()
    .isLength({ min: 45 })
    .withMessage("متن تیکت شما نباید کمتر از 45 حرف باشد"),
  isAccessForCreateTicket,
  createTicketFunc,
);

ticketRouter.get("/my-tickets", myTicketFunc);
ticketRouter.get("/all-tickets", allTicketCount);
ticketRouter.get("/pending-tickets", pendingTicketCount);
ticketRouter.get("/closed-tickets", colsedTicketCount);
ticketRouter.get("/answered-tickets", answeredTicketCount);

export default ticketRouter;
