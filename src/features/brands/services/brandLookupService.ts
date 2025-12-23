import { apiClient } from '@/shared/lib/api-client';
import { Brand } from '../types/brandTypes';

// Fetch brands for lookup (simple list for dropdowns)
export const fetchBrandsLookupApi = async (): Promise<Brand[]> => {
  const response = await apiClient.get<{ success: boolean; brands: Brand[] }>('/admin/brands');
  if (!response.data.success) {
    throw new Error('خطا در دریافت برندها');
  }
  return response.data.brands || [];
};

