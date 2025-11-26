// types/index.ts

export interface User {
  id: string;
  phone_number: string;
  full_name: string | null;
  address: string | null;
  postal_code: string | null;
  role: 'customer' | 'admin';
  profile_completed: boolean;
  birthday: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface AuthState {
  user: User | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setRefreshToken: (token: string | null) => void;
  logout: () => void;
}

export interface OTPSendRequest {
  phone_number: string;
}

export interface OTPVerifyRequest {
  phone_number: string;
  otp_code: string;
}

export interface CompleteProfileRequest {
  full_name: string;
  address: string;
  postal_code?: string;
  birthday?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  refreshToken?: string;
  requiresProfileCompletion?: boolean;
}

export interface JWTPayload {
  userId: string;
  phone_number: string;
  role: string;
  iat?: number;
  exp?: number;
}