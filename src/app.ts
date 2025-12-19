import express, { Express } from "express";
import { prismaConnect } from "./database/prismaConnect";

export default class App {

  private app: Express;
  private port: string;
  private apiRoutes = {
    orders: "/ordes"
  }

  constructor() {
    this.app =  express();
    this.port = process.env.PORT || "3001";
    this.dbConnection();
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Server online in port ${this.port}`)
    });
  }

  public async dbConnection(): Promise <void> {
    try {
      await prismaConnect;
      console.log('Database online')
    } catch (error) {
      console.log(error)
    }
  } 
};