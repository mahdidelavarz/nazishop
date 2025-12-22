// Product Form Schema and Types
import * as z from 'zod';

export const productFormSchema = z.object({
  // Basic Info
  title: z.string().min(1, 'عنوان الزامی است'),
  slug: z
    .string()
    .min(1, 'اسلاگ الزامی است')
    .regex(/^[a-z0-9-]+$/, 'فقط حروف کوچک، اعداد و خط تیره مجاز است'),
  
  // Pricing
  price: z.number().min(0, 'قیمت نمی‌تواند منفی باشد'),
  original_price: z.number().min(0, 'قیمت اصلی نمی‌تواند منفی باشد').nullable(),
  
  // Inventory
  stock: z.number().min(0, 'موجودی نمی‌تواند منفی باشد'),
  sku: z.string().optional().nullable(),
  
  // Details
  brand: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  
  // Media
  thumbnail_url: z
    .string()
    .url('آدرس معتبر وارد کنید')
    .optional()
    .nullable()
    .or(z.literal('')),
  images: z.any().optional(),
  
  // Organization
  tags: z.array(z.string()),
  category_id: z.string().optional().nullable(),
  
  // Settings
  is_public: z.boolean(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

export const defaultFormValues: ProductFormData = {
  title: '',
  slug: '',
  price: 0,
  original_price: null,
  stock: 0,
  sku: null,
  brand: null,
  description: null,
  thumbnail_url: null,
  tags: [],
  category_id: null,
  is_public: true,
};

// Helper to generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Helper to calculate discount percent
export const calculateDiscountPercent = (
  price: number,
  originalPrice: number | null
): number | null => {
  if (!originalPrice || originalPrice <= 0 || originalPrice <= price) {
    return null;
  }
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

