// mobile/types/auth.types.ts

/**
 * User Authentication Types
 */

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Organizer {
  id: string;
  name: string;
  email?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends AuthCredentials {
  name: string;
}

export interface ValidationErrors {
  name: string;
  email: string;
  password: string;
}
