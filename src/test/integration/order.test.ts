import request from 'supertest';
import App from '../../app';
import { v4 as uuidv4 } from 'uuid';
import { prismaConnection } from '../../database/prismaConnect';

const appInstance = new App();
const server = (appInstance as any).app; 

describe('Order Integration Tests', () => {
  beforeAll(async () => {
    await prismaConnection.$connect();
  });

  afterAll(async () => {
    await prismaConnection.$disconnect();
  });

  it('should process payment and create outbox event atomically', async () => {
    const order = await prismaConnection.order.create({
      data: { id: uuidv4(), amount: 5000, status: 'CREATED' }
    });

    const response = await request(server)
      .post(`/orders/${order.id}/pay`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('PAID');

    const outboxEvent = await prismaConnection.outboxEvent.findFirst({
      where: { payload: { path: ['orderId'], equals: order.id } }
    });

    expect(outboxEvent).toBeDefined();
    expect(outboxEvent?.eventType).toBe('orderPaid');
    
    const payload = outboxEvent?.payload as any;
    expect(payload).toHaveProperty('orderId', order.id);
    expect(payload).toHaveProperty('amount', 5000);
    expect(payload).toHaveProperty('occurredAt');
  });
});