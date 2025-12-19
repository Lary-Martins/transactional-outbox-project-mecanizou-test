import { v4 as uuidv4 } from 'uuid';
import { EventType, IOrderResponse, OrderStatus } from '../interfaces/IOrder';
import { StatusCodes } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';

export class OrderService {
  constructor(private readonly prisma: PrismaClient) {}

  public async createOrder(data: { amount: number }): Promise<IOrderResponse> {
    try {
      const order = {
        id: uuidv4(),
        amount: data.amount,
        status: OrderStatus.CREATED
      }

      const response = await this.prisma.order.create({data: order});
      return {code: StatusCodes.CREATED, data: response};
    } catch(error) {
      const message = error as string;
      throw new Error(message);
    }
  
  }

  public async payOrder(orderId: string): Promise<IOrderResponse> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ where: { id: orderId } });
        
        if (!order) {
          return { code: StatusCodes.NOT_FOUND, data: { error: 'Order not found' } };
        }
        if (order.status === OrderStatus.PAID) {
          return { code: StatusCodes.OK, data: order };
        }
        
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.PAID }
        });

        const eventId = uuidv4();
        await tx.outboxEvent.create({
          data: {
            id: eventId,
            eventType: EventType.OrderPaid,
            status: OrderStatus.PENDING,
            payload: {
              eventId: eventId,
              eventType: 'OrderPaid',
              orderId: updatedOrder.id,
              amount: updatedOrder.amount,
              occurredAt: new Date().toISOString()
            }
          }
        });

        return { code: StatusCodes.OK, data: updatedOrder };
      });
      return result;
    } catch (error) {
      const message = error as string;
      throw new Error(message);
    }
  }
}