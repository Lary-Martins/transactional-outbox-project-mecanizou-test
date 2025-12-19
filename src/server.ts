import dotenv from "dotenv"; 
import App from "./app";

dotenv.config();

const server = new App();

server.listen();