import { Router } from "express";
import OrderController from "../controllers/OrderController";
import { OrderService } from "../services/orderService";
import { prismaConnection } from "../database/prismaConnect";

const orderRoutes = Router();
const orderService = new OrderService(prismaConnection);
const orderController = new OrderController(orderService);

orderRoutes.post('/',        orderController.createOrder.bind(orderController));
orderRoutes.post('/:id/pay', orderController.payOrder.bind(orderController));

export default orderRoutes;