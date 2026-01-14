import { Request, Response } from "express";

export default interface IOrderController {
  createOrder(req: Request, res: Response ): Promise<void>;
  payOrder(req: Request, res: Response ): Promise<void>
}