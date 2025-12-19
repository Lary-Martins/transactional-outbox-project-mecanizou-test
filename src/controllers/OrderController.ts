import { Request, Response } from 'express';
import { OrderService } from '../services/orderService';

export default class OrderController {
  constructor(private readonly orderService: OrderService) {}

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderPayload = req.body;
      const response = await this.orderService.createOrder(orderPayload);
      res.status(response.code).json(response.data);
    } catch (error) {
      const message = error as string;
      throw new Error(message);
    }
  }

  async payOrder(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try{
      const response = await this.orderService.payOrder(id);
      res.status(response.code).json(response.data);
    } catch (error) {
      const message = error as string;
      throw new Error(message);
    }
  } 
}