// /types/auth.ts
export interface LoginFormValues {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  address?: string;
  postal_code?: string;
  birthday?: string;
  profile_completed?: boolean;
  role?: string;
}

export interface LoginResponse {
  user: UserProfile;
  profile_completed: boolean;
}
