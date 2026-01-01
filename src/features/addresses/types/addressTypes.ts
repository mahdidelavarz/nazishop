// Address Types

export interface UserAddress {
  id: string;
  user_id: string;
  label: string | null;
  full_name: string;
  phone_number: string | null;
  address_line: string;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressPayload {
  label?: string;
  full_name: string;
  phone_number?: string;
  address_line: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  is_default?: boolean;
}

export interface UpdateAddressPayload extends Partial<CreateAddressPayload> {
  id: string;
}

export interface AddressResponse {
  success: boolean;
  address?: UserAddress;
  addresses?: UserAddress[];
  message?: string;
}

