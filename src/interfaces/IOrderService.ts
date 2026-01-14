import { IOrderResponse } from "./IOrder";

export default interface IOrderService {
  createOrder(data: { amount: number }): Promise<IOrderResponse | null>;
  payOrder(id: string): Promise<IOrderResponse>;
}