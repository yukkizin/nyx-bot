export type AppErrorCode =
  "VALIDATION" | "NOT_FOUND" | "FORBIDDEN" | "DATABASE" | "INTERNAL";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: AppErrorCode = "INTERNAL",
    public readonly userMessage: string = "Ocorreu um erro inesperado. Tente novamente.",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function getUserErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
}
