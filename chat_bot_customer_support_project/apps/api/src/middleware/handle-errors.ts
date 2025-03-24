import type { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = "INTERNAL_SERVER_ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleErrors(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      message: "Internal Server Error",
      code: "INTERNAL_SERVER_ERROR",
    },
  });
}
