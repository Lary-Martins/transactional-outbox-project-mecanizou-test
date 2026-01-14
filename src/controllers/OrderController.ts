import { Request, Response } from 'express';
import IOrderController from '../interfaces/IOrderController';
import IOrderService from '../interfaces/IOrderService';
import { OrderServiceFactory } from '../factory/orderServiceFactory';
import { StatusCodes } from 'http-status-codes';

export default class OrderController implements IOrderController {
  private readonly orderServiceFactory: IOrderService;

  constructor() {
    this.orderServiceFactory = OrderServiceFactory()
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderPayload = req.body;
      const response = await this.orderServiceFactory.createOrder(orderPayload);
      if (response) {
        res.status(response.code).json(response.message);
      }
    } catch (error) {
      const message = error as string;
      throw new Error(message);
    }
  }

  async payOrder(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Order ID is required' });
      return;
    }

    try{
      const response = await this.orderServiceFactory.payOrder(id);
      if (response) {
        res.status(response.code).json(response.message);
      }
    } catch (error) {
      const message = error as string;
      throw new Error(message);
    }
  } 
}