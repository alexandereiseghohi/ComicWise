/**
 * Action Response Types
 * Core response types for server actions
 */

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SimpleActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

export interface ActionSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ActionError {
  success: false;
  error: string;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthActionResponse<T = unknown> extends ActionResponse<T> {
  redirectTo?: string;
  user?: {
    id: string;
    name?: string | null;
    email: string;
    role: "user" | "admin" | "moderator";
  };
}
