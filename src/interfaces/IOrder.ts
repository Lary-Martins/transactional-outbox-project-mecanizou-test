import { StatusCodes } from "http-status-codes";

export interface IOrder {
  id: string,
  status: OrderStatus,
  amount: number,
}

export enum OrderStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  CREATED = 'CREATED',
}

export enum EventType {
  OrderPaid = 'orderPaid'
}

export interface IOrderResponse {
  code: StatusCodes,
  message: IOrder | string
}