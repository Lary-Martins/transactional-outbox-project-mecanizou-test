import express, { Express } from "express";
import { prismaConnection } from "./database/prismaConnect";
import orderRoutes from "./routes/orderRoutes";
import { internalError } from "./middleware/internalError";

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

  public async dbConnection(): Promise <void> {
    try {
      await prismaConnection;
      console.log('Database online');
    } catch (error) {
      console.log(error);
    }
  } 

  public middlewares(): void {
    this.app.use(express.json());
  }

  public routes(): void {
    this.app.use(this.apiRoutes.orders, orderRoutes);
  }

  public errorHandler(): void {
    this.app.use(internalError);
  }
};