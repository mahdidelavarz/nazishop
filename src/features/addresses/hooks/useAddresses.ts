'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as addressService from '../services/addressService';
import type { CreateAddressPayload, UpdateAddressPayload, UserAddress } from '../types/addressTypes';

const ADDRESSES_KEY = ['addresses'];

// Hook to get all addresses
export function useAddresses() {
  return useQuery({
    queryKey: ADDRESSES_KEY,
    queryFn: addressService.getAddresses,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get single address
export function useAddress(id: string) {
  return useQuery({
    queryKey: [...ADDRESSES_KEY, id],
    queryFn: () => addressService.getAddress(id),
    enabled: !!id,
  });
}

// Hook to create address
export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAddressPayload) => addressService.createAddress(data),
    onSuccess: (newAddress) => {
      queryClient.setQueryData<UserAddress[]>(ADDRESSES_KEY, (old) => {
        // If new address is default, unset others
        if (newAddress.is_default && old) {
          return [...old.map(a => ({ ...a, is_default: false })), newAddress];
        }
        return old ? [...old, newAddress] : [newAddress];
      });
      toast.success('آدرس با موفقیت اضافه شد');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در ایجاد آدرس');
    },
  });
}

// Hook to update address
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAddressPayload) => addressService.updateAddress(data),
    onSuccess: (updatedAddress) => {
      queryClient.setQueryData<UserAddress[]>(ADDRESSES_KEY, (old) => {
        if (!old) return [updatedAddress];
        // If updated address is default, unset others
        if (updatedAddress.is_default) {
          return old.map(a => 
            a.id === updatedAddress.id ? updatedAddress : { ...a, is_default: false }
          );
        }
        return old.map(a => a.id === updatedAddress.id ? updatedAddress : a);
      });
      toast.success('آدرس با موفقیت بروزرسانی شد');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در بروزرسانی آدرس');
    },
  });
}

// Hook to delete address
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<UserAddress[]>(ADDRESSES_KEY, (old) => {
        return old ? old.filter(a => a.id !== deletedId) : [];
      });
      toast.success('آدرس با موفقیت حذف شد');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در حذف آدرس');
    },
  });
}

// Hook to set default address
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressService.setDefaultAddress(id),
    onSuccess: (updatedAddress) => {
      queryClient.setQueryData<UserAddress[]>(ADDRESSES_KEY, (old) => {
        if (!old) return [updatedAddress];
        return old.map(a => ({
          ...a,
          is_default: a.id === updatedAddress.id
        }));
      });
      toast.success('آدرس پیش‌فرض تنظیم شد');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در تنظیم آدرس پیش‌فرض');
    },
  });
}

