// mobile/types/ui.types.ts

/**
 * UI Component Types
 */

export interface Tab {
  key: string;
  icon: string;
  label: string;
  badge?: number;
}

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number;
}

export interface AuthMode {
  mode: "login" | "register";
}

export type SortOption =
  | "date_asc"
  | "date_desc"
  | "alpha_asc"
  | "alpha_desc"
  | "capacity_asc"
  | "capacity_desc";
