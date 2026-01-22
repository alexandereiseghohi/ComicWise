import type { ActionError, ActionResult, ActionSuccess } from "@/dto";

/**
 * Type guard to check if an ActionResult is an error
 * @param result - The ActionResult to check
 * @returns true if the result is an ActionError
 */
export function isActionError<T>(result: ActionResult<T>): result is ActionError {
  return !result.success;
}

/**
 * Type guard to check if an ActionResult is a success
 * @param result - The ActionResult to check
 * @returns true if the result is an ActionSuccess
 */
export function isActionSuccess<T>(result: ActionResult<T>): result is ActionSuccess<T> {
  return result.success;
}

/**
 * Assert that an ActionResult is successful, throwing if not
 * @param result - The ActionResult to check
 * @throws Error if the result is an error
 */
export function assertActionSuccess<T>(result: ActionResult<T>): asserts result is ActionSuccess<T> {
  if (!result.success) {
    throw new Error(isActionError(result) ? result.error : "Action failed");
  }
}

/**
 * Get the error message from an ActionResult if it's an error
 * @param result - The ActionResult to check
 * @returns The error message, or undefined if success
 */
export function getActionError<T>(result: ActionResult<T>): string | undefined {
  return isActionError(result) ? result.error : undefined;
}

/**
 * Get the data from an ActionResult if it's successful
 * @param result - The ActionResult to check
 * @returns The data, or undefined if error
 */
export function getActionData<T>(result: ActionResult<T>): T | undefined {
  return isActionSuccess(result) ? result.data : undefined;
}
