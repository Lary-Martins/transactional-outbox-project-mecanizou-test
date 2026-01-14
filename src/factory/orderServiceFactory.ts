import { prismaConnection } from "../database/prismaConnect";
import { OrderService } from "../services/orderService";

export const OrderServiceFactory = () => new OrderService(prismaConnection);