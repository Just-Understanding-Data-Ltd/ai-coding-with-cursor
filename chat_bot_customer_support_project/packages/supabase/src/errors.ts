export enum SupabaseErrorCode {
  // CRUD Operation Codes
  CREATE_FAILED = "CREATE_FAILED",
  READ_FAILED = "READ_FAILED",
  UPDATE_FAILED = "UPDATE_FAILED",
  DELETE_FAILED = "DELETE_FAILED",

  // Additional Common Error Codes
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_FAILED = "VALIDATION_FAILED",
  UNAUTHORIZED = "UNAUTHORIZED",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export abstract class SupabaseOperationError extends Error {
  constructor(
    public readonly operation: string,
    public readonly message: string,
    public readonly toastMessage: string,
    public readonly errorCode: SupabaseErrorCode,
    public readonly cause?: unknown
  ) {
    super(`${operation} failed: ${message}`);
    this.name = "SupabaseOperationError";
  }
}
