import { Router } from "express";
import OrderController from "../controllers/OrderController";

const orderRoutes = Router();
const orderController = new OrderController();

orderRoutes.post('/',        orderController.createOrder.bind(orderController));
orderRoutes.post('/:id/pay', orderController.payOrder.bind(orderController));

export default orderRoutes;