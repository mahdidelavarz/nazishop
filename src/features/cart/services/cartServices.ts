
import { apiClient } from '@/shared/lib/api-client';
import { CartItem } from '../types/cartTypes';

// Sync guest cart to database when user logs in (via API route)
export async function syncGuestCart(guestItems: CartItem[]) {
  // Prepare items for API
  const items = guestItems.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity
  }));

  const response = await apiClient.post('/cart/sync', { items });
  return response.data;
}