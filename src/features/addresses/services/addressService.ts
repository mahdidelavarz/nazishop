import { apiClient } from '@/shared/lib/api-client';
import type { UserAddress, CreateAddressPayload, UpdateAddressPayload, AddressResponse } from '../types/addressTypes';

// Get all addresses for current user
export async function getAddresses(): Promise<UserAddress[]> {
  const response = await apiClient.get<AddressResponse>('/addresses');
  return response.data.addresses || [];
}

// Get single address by ID
export async function getAddress(id: string): Promise<UserAddress | null> {
  const response = await apiClient.get<AddressResponse>(`/addresses/${id}`);
  return response.data.address || null;
}

// Create new address
export async function createAddress(data: CreateAddressPayload): Promise<UserAddress> {
  const response = await apiClient.post<AddressResponse>('/addresses', data);
  if (!response.data.address) {
    throw new Error(response.data.message || 'خطا در ایجاد آدرس');
  }
  return response.data.address;
}

// Update address
export async function updateAddress({ id, ...data }: UpdateAddressPayload): Promise<UserAddress> {
  const response = await apiClient.patch<AddressResponse>(`/addresses/${id}`, data);
  if (!response.data.address) {
    throw new Error(response.data.message || 'خطا در بروزرسانی آدرس');
  }
  return response.data.address;
}

// Delete address
export async function deleteAddress(id: string): Promise<void> {
  await apiClient.delete(`/addresses/${id}`);
}

// Set address as default
export async function setDefaultAddress(id: string): Promise<UserAddress> {
  const response = await apiClient.patch<AddressResponse>(`/addresses/${id}/default`);
  if (!response.data.address) {
    throw new Error(response.data.message || 'خطا در تنظیم آدرس پیش‌فرض');
  }
  return response.data.address;
}

