/**
 * Represents a chat message content
 */
export interface ChatMessageContent {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Error manager to create consistent error objects
 */
export class ErrorManager {
  private errorDefs: Record<string, { message: string; statusCode: number }>;

  constructor(
    errorDefs: Record<string, { message: string; statusCode: number }>
  ) {
    this.errorDefs = errorDefs;
  }

  /**
   * Create an error with the given error code
   * @param code Error code
   * @param message Optional custom message
   * @param statusCode Optional status code override
   * @param originalError Optional original error
   * @returns Error object
   */
  create(
    code: string,
    message?: string,
    statusCode?: number,
    originalError?: any
  ): Error {
    const errorDef = this.errorDefs[code];
    if (!errorDef) {
      return new Error(`Unknown error: ${code}`);
    }

    const error = new Error(message || errorDef.message);
    error.name = code;
    (error as any).statusCode = statusCode || errorDef.statusCode;
    (error as any).originalError = originalError;

    return error;
  }
}
