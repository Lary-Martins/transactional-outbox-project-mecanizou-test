import express, { Express } from "express";
import { prismaConnection } from "./database/prismaConnect";
import orderRoutes from "./routes/orderRoutes";
import { internalError } from "./middleware/internalError";
import morgan from "morgan";

export default class App {

  private app: Express;
  private port: string;
  private apiRoutes = {
    orders: "/orders"
  }

  constructor() {
    this.app =  express();
    this.port = process.env.PORT || "3001";
    this.dbConnection();
    this.middlewares();
    this.routes();
    this.errorHandler();
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Server online in port ${this.port}`)
    });
  }

  public dbConnection(): void {
    try {
      prismaConnection;
      console.log('Database online');
    } catch (error) {
      console.log(error);
    }
  } 

  public middlewares(): void {
    this.app.use(express.json());
    this.app.use(morgan(":method :url :status :response-time"));
  }

  public routes(): void {
    this.app.use(this.apiRoutes.orders, orderRoutes);
  }

  public errorHandler(): void {
    this.app.use(internalError);
  }
};