import { Response, Request, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export const internalError = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.log(error);
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json('Internal Server Error')
}