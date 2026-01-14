import { v4 as uuidv4 } from 'uuid';
import { EventType, IOrderResponse, OrderStatus } from '../interfaces/IOrder';
import { StatusCodes } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';

export class OrderService {
  constructor(private readonly prisma: PrismaClient) { }

  private async publishEvent(eventType: EventType, payload: any): Promise<void> {
    try {
      const eventId = uuidv4();
      const event = {
        id: eventId,
        eventType: eventType,
        status: 'PENDING' as const,
        payload: {
          eventId: eventId,
          eventType: eventType,
          orderId: payload.id,
          amount: payload.amount,
          occurredAt: new Date().toISOString()
        }
      }
      await this.prisma.outboxEvent.create({ data: event });
    } catch (error) {
      const message = error as string;
      throw new Error(message);
    }
  }

  public async createOrder(payload: { amount: number }): Promise<IOrderResponse> {
    try {
      const orderData = {
        id: uuidv4(),
        amount: payload.amount,
        status: OrderStatus.CREATED as const
      }

      const response = await this.prisma.order.create({ data: orderData });
      if (!response) {
        return {code: StatusCodes.BAD_REQUEST, message: 'Order not created'};
      }

      return {
        code: StatusCodes.CREATED,
        message: {
          id: response.id,
          amount: response.amount,
          status: OrderStatus.CREATED
        }
      };
    } catch (error) {
      const message = error as string;
      throw new Error(message);
    }
  }

  public async payOrder(orderId: string): Promise<IOrderResponse> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ where: { id: orderId } });

        if (!order) {
          return {code: StatusCodes.NOT_FOUND, message: 'Order not found'};
        }
        if (order.status === OrderStatus.PAID) {
          return {
            code: StatusCodes.OK,
            message: {
              id: order.id,
              amount: order.amount,
              status: OrderStatus.PAID
            }
          };
        }

        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.PAID }
        });

        await this.publishEvent(EventType.OrderPaid, updatedOrder);

        return {
          code: StatusCodes.OK,
          message: {
            id: updatedOrder.id,
            amount: updatedOrder.amount,
            status: OrderStatus.PAID
          }
        };
      });
      return result;
    } catch (error) {
      const message = error as string;
      throw new Error(message);
    }
  }

}