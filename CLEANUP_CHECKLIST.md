# Project Cleanup & Enhancement Checklist

## 1. Pages That Need to Be Server-Side

### High Priority
- ✅ **`src/app/(public)/products/page.tsx`** - Already server-side (good!)
- ✅ **`src/app/(public)/products/[slug]/page.tsx`** - Already server-side (good!)
- ❌ **`src/app/(public)/page.tsx`** - Currently client-side, should be server-side
  - Fetch categories, brands, and products on server
  - Only hero slider and interactive parts should be client-side
  - Move data fetching to server component, pass to client component

### Medium Priority
- ❌ **`src/app/(admin)/admin-dashboard/page.tsx`** - Should fetch initial data server-side
  - Products stats can be fetched on server
  - Only interactive dashboard widgets need client-side

### Low Priority
- Consider server-side rendering for static content pages (about, contact, FAQ if they exist)

---

## 2. Components That Need to Be Split into Server/Client Parts

### High Priority
- **`src/app/(public)/page.tsx`** (HomePage)
  - **Server Component**: Fetch categories, brands, discount products
  - **Client Component**: Hero slider, newsletter form, interactive sections
  - Split into: `HomePageServer.tsx` + `HomePageClient.tsx`

- **`src/shared/layouts/Header.tsx`**
  - **Server Component**: Fetch initial cart/wishlist counts (if possible)
  - **Client Component**: Interactive menu, search, user menu, cart preview
  - Split into: `HeaderServer.tsx` + `HeaderClient.tsx`

### Medium Priority
- **`src/features/products/components/ProductsClient.tsx`**
  - Already has server-side data fetching in page
  - Consider extracting filter logic to separate client component

- **`src/features/products/components/SingleProductClient.tsx`**
  - Already has server-side data fetching in page
  - Good separation already

---

## 3. Components That Do Too Much and Need to Be Broken Down

### High Priority
- **`src/app/(public)/page.tsx`** (635 lines!)
  - Extract: `HeroSlider.tsx` (slider logic)
  - Extract: `CategoriesSection.tsx` (categories grid)
  - Extract: `DiscountProductsSection.tsx` (discount products)
  - Extract: `FeaturesSection.tsx` (features grid)
  - Extract: `BrandsSection.tsx` (brands grid)
  - Extract: `NewsletterSection.tsx` (newsletter CTA)
  - Extract: `Footer.tsx` (footer component)

- **`src/app/(store)/cart/page.tsx`** (275 lines)
  - Extract: `CartHeader.tsx`
  - Extract: `CartItemList.tsx`
  - Extract: `CartItem.tsx` (already exists but check if used)
  - Extract: `CartSummary.tsx` (order summary sidebar)
  - Extract: `EmptyCartState.tsx`

- **`src/app/(store)/checkout/page.tsx`** (335 lines)
  - Extract: `CheckoutHeader.tsx`
  - Extract: `OrderItemsList.tsx`
  - Extract: `ShippingMethodSelector.tsx`
  - Extract: `CheckoutSummary.tsx`

- **`src/app/(store)/orders/page.tsx`** (281 lines)
  - Extract: `OrdersHeader.tsx`
  - Extract: `OrderStatusFilter.tsx`
  - Extract: `OrderList.tsx`
  - Extract: `OrderCard.tsx`
  - Extract: `Pagination.tsx` (reusable)

- **`src/app/(admin)/admin-dashboard/page.tsx`** (254 lines)
  - Extract: `DashboardStats.tsx`
  - Extract: `QuickActions.tsx`
  - Extract: `RecentProducts.tsx`

- **`src/app/(admin)/admin-categories/page.tsx`** (544 lines)
  - Extract: `CategoryModal.tsx` (already exists but inline)
  - Extract: `CategoryCard.tsx` (already exists but inline)
  - Extract: `CategoryStats.tsx`
  - Move inline components to separate files

- **`src/app/(admin)/admin-brands/page.tsx`** (607 lines)
  - Extract: `BrandModal.tsx` (already exists but inline)
  - Extract: `BrandCard.tsx` (already exists but inline)
  - Extract: `BrandStats.tsx`
  - Move inline components to separate files

### Medium Priority
- **`src/shared/layouts/Header.tsx`** (187 lines)
  - Already well split into sub-components
  - Consider extracting scroll logic to custom hook

- **`src/features/products/components/ProductsClient.tsx`** (167 lines)
  - Already well structured
  - Consider extracting filter state management to custom hook

---

## 4. Repetitive Code That Should Become Separate Components

### High Priority - Loading States
Create: `src/shared/ui/LoadingState.tsx`
- Used in: cart, wishlist, orders, checkout, admin pages
- Pattern: Centered spinner with message
- Standardize: Icon, message, styling

### High Priority - Error States
Create: `src/shared/ui/ErrorState.tsx`
- Used in: cart, wishlist, orders, checkout, admin pages
- Pattern: Error icon, message, retry button
- Standardize: Icon, message, retry handler

### High Priority - Empty States
Create: `src/shared/ui/EmptyState.tsx`
- Used in: cart, wishlist, orders, products, admin pages
- Pattern: Icon, title, description, action button
- Standardize: Icon, title, description, action props

### High Priority - Page Headers
Create: `src/shared/ui/PageHeader.tsx`
- Used in: cart, wishlist, orders, products, checkout
- Pattern: Title, subtitle, back/action link
- Standardize: Title, description, action props

### High Priority - Pagination
Create: `src/shared/ui/Pagination.tsx`
- Used in: orders page, admin orders
- Pattern: Previous/Next buttons, page numbers
- Standardize: Current page, total pages, onPageChange

### Medium Priority - Status Badges
Create: `src/shared/ui/StatusBadge.tsx`
- Used in: orders (multiple status types)
- Pattern: Colored badge with status text
- Standardize: Status type, label mapping

### Medium Priority - Search Input
Create: `src/shared/ui/SearchInput.tsx`
- Used in: products, admin pages
- Pattern: Input with search icon
- Standardize: Value, onChange, placeholder

### Medium Priority - Modal/Dialog
Create: `src/shared/ui/Modal.tsx`
- Used in: admin-categories, admin-brands
- Pattern: Overlay, centered content, close button
- Standardize: Open, onClose, title, children

### Medium Priority - Confirmation Dialog
Create: `src/shared/ui/ConfirmDialog.tsx`
- Used in: Multiple admin pages (window.confirm)
- Pattern: Modal with confirm/cancel buttons
- Standardize: Message, onConfirm, onCancel

### Low Priority - Image Placeholder
Create: `src/shared/ui/ImagePlaceholder.tsx`
- Used in: Product cards, cart items, wishlist
- Pattern: Gray box with icon when no image
- Standardize: Size, icon, alt text

### Low Priority - Price Display
Create: `src/shared/ui/PriceDisplay.tsx`
- Used in: Products, cart, checkout, orders
- Pattern: Formatted price with discount handling
- Standardize: Price, originalPrice, discount, currency

### Low Priority - Quantity Selector
Create: `src/shared/ui/QuantitySelector.tsx`
- Used in: Cart page
- Pattern: Minus/Plus buttons with quantity display
- Standardize: Value, min, max, onChange, disabled

---

## 5. Folder Structure Enhancements

### High Priority
- **Create `src/shared/ui/states/`** folder
  - Move: `LoadingState.tsx`, `ErrorState.tsx`, `EmptyState.tsx`
  
- **Create `src/shared/ui/forms/`** folder
  - Move: `InputComponent.tsx`, `TextareaComponent.tsx`
  - Add: `SearchInput.tsx`, `QuantitySelector.tsx`

- **Create `src/shared/ui/layout/`** folder
  - Move: `PageHeader.tsx` (to be created)
  - Move: `Pagination.tsx` (to be created)

- **Create `src/shared/ui/feedback/`** folder
  - Move: `StatusBadge.tsx` (to be created)
  - Move: `Modal.tsx` (to be created)
  - Move: `ConfirmDialog.tsx` (to be created)

- **Create `src/shared/ui/product/`** folder
  - Move: `ImagePlaceholder.tsx` (to be created)
  - Move: `PriceDisplay.tsx` (to be created)

- **Reorganize `src/app/(public)/page.tsx` components**
  - Create: `src/features/home/components/`
    - `HeroSlider.tsx`
    - `CategoriesSection.tsx`
    - `DiscountProductsSection.tsx`
    - `FeaturesSection.tsx`
    - `BrandsSection.tsx`
    - `NewsletterSection.tsx`
    - `Footer.tsx`

- **Reorganize admin page components**
  - Create: `src/features/admin/ui/Categories/`
    - Move inline components from `admin-categories/page.tsx`
  - Create: `src/features/admin/ui/Brands/`
    - Move inline components from `admin-brands/page.tsx`
  - Create: `src/features/admin/ui/Dashboard/`
    - Move components from `admin-dashboard/page.tsx`

- **Reorganize store page components**
  - Create: `src/features/cart/ui/`
    - Move cart page components
  - Create: `src/features/checkout/ui/`
    - Move checkout page components
  - Create: `src/features/orders/ui/`
    - Move order page components (some already exist)

### Medium Priority
- **Create `src/shared/hooks/`** folder
  - Move shared hooks from `src/shared/hooks/` (if any)
  - Add: `useScroll.ts`, `useDebounce.ts`, `useLocalStorage.ts`

- **Create `src/shared/utils/`** folder
  - Already exists, ensure all utilities are there
  - Add: `formatPrice.ts`, `formatDate.ts`, `validateEmail.ts`

- **Create `src/shared/constants/`** folder
  - Move: Status labels, colors, shipping options
  - Add: `orderStatus.ts`, `shippingOptions.ts`, `appConfig.ts`

### Low Priority
- Consider creating `src/shared/types/` for shared TypeScript types
- Consider creating `src/shared/config/` for configuration files

---

## 6. New Features That Need to Be Added

### High Priority
- **Error Boundary Component**
  - Create: `src/shared/components/ErrorBoundary.tsx`
  - Wrap app sections to catch React errors gracefully

- **Loading Skeletons**
  - Create: `src/shared/ui/skeletons/`
  - Add: `ProductCardSkeleton.tsx`, `CartItemSkeleton.tsx`, `OrderCardSkeleton.tsx`
  - Replace loading spinners with skeletons for better UX

- **Toast Notifications System**
  - Already using `react-hot-toast`
  - Create wrapper: `src/shared/ui/Toast.tsx`
  - Standardize toast messages across app

- **Form Validation Utilities**
  - Create: `src/shared/utils/validation.ts`
  - Add: Email, phone, required field validators
  - Use with react-hook-form resolvers

### Medium Priority
- **Image Optimization Component**
  - Create: `src/shared/ui/OptimizedImage.tsx`
  - Wrap Next.js Image with error handling and placeholder
  - Standardize image loading across app

- **Breadcrumb Component**
  - Already exists: `ProductBreadcrumb.tsx`
  - Make it generic: `src/shared/ui/Breadcrumb.tsx`
  - Use in: Products, orders, admin pages

- **Tabs Component**
  - Create: `src/shared/ui/Tabs.tsx`
  - Use in: Product details, order details, profile

- **Accordion Component**
  - Create: `src/shared/ui/Accordion.tsx`
  - Use in: FAQ, product details, order details

- **Tooltip Component**
  - Create: `src/shared/ui/Tooltip.tsx`
  - Use for help text, button descriptions

- **Dropdown Menu Component**
  - Create: `src/shared/ui/Dropdown.tsx`
  - Standardize dropdowns (user menu, filters, etc.)

### Low Priority
- **Rating Component**
  - Create: `src/shared/ui/Rating.tsx`
  - Use in: Products, reviews

- **Progress Bar Component**
  - Create: `src/shared/ui/ProgressBar.tsx`
  - Use in: Order tracking, upload progress

- **Badge Component**
  - Create: `src/shared/ui/Badge.tsx`
  - Generic badge (discount, new, featured, etc.)

- **Divider Component**
  - Create: `src/shared/ui/Divider.tsx`
  - Use for section separation

- **Card Component**
  - Create: `src/shared/ui/Card.tsx`
  - Generic card wrapper with variants

---

## 7. Other Cleanup Items

### High Priority
- **Remove Duplicate Loading/Error/Empty States**
  - Consolidate all loading states to `LoadingState.tsx`
  - Consolidate all error states to `ErrorState.tsx`
  - Consolidate all empty states to `EmptyState.tsx`

- **Standardize API Error Handling**
  - Create: `src/shared/utils/errorHandler.ts`
  - Standardize error messages and handling
  - Replace `window.confirm` with `ConfirmDialog` component

- **Extract Magic Numbers and Strings**
  - Move to constants file
  - Examples: Shipping prices, discount thresholds, pagination limits

- **Remove Commented Code**
  - Clean up commented imports (e.g., `useAuth` in homepage)
  - Remove unused commented code blocks

- **Standardize Image URL Handling**
  - Create: `src/shared/utils/image.ts`
  - Function to normalize image URLs (http, https, relative paths)
  - Used in multiple places with duplicate logic

- **Standardize Price Formatting**
  - Create: `src/shared/utils/price.ts` (may already exist)
  - Ensure consistent price formatting across app
  - Handle currency, locale, discount calculations

- **Extract Status Constants**
  - Create: `src/shared/constants/orderStatus.ts`
  - Move STATUS_LABELS, STATUS_COLORS from pages
  - Use in: orders page, admin orders, order details

- **Extract Shipping Options**
  - Create: `src/shared/constants/shipping.ts`
  - Move SHIPPING_OPTIONS from checkout page
  - Reuse in admin if needed

### Medium Priority
- **TypeScript Improvements**
  - Add missing type definitions
  - Remove `any` types
  - Add proper interfaces for all props

- **Accessibility Improvements**
  - Add ARIA labels to interactive elements
  - Ensure keyboard navigation works
  - Add focus management for modals

- **Performance Optimizations**
  - Add `React.memo` to expensive components
  - Optimize re-renders with proper dependency arrays
  - Consider code splitting for large components

- **Code Consistency**
  - Standardize component naming (PascalCase)
  - Standardize file naming (kebab-case vs camelCase)
  - Standardize import order (external, internal, relative)

- **Remove Unused Imports**
  - Clean up unused imports across all files
  - Use ESLint to catch unused imports

- **Extract Custom Hooks**
  - `useScroll.ts` - Extract scroll logic from Header
  - `useDebounce.ts` - For search inputs
  - `useLocalStorage.ts` - For client-side storage
  - `usePagination.ts` - For pagination logic

- **Standardize Form Handling**
  - Create form utilities
  - Standardize form validation
  - Create reusable form components

### Low Priority
- **Documentation**
  - Add JSDoc comments to complex functions
  - Document component props with TypeScript
  - Add README to complex feature folders

- **Testing Setup**
  - Add unit tests for utilities
  - Add component tests for shared components
  - Add integration tests for critical flows

- **Environment Variables**
  - Document all environment variables
  - Create `.env.example` file
  - Validate env vars on startup

- **SEO Improvements**
  - Ensure all pages have proper metadata
  - Add Open Graph tags where missing
  - Add structured data (JSON-LD) for products

- **Internationalization (i18n)**
  - Extract all hardcoded Persian text
  - Consider i18n library for future multi-language support

---

## Summary Statistics

- **Total Pages Analyzed**: 15+
- **Total Components Analyzed**: 50+
- **Client Components**: 84 files with "use client"
- **Server Components**: 2 pages (products, product detail)
- **Largest Files**: 
  - `page.tsx` (homepage): 635 lines
  - `admin-brands/page.tsx`: 607 lines
  - `admin-categories/page.tsx`: 544 lines

---

## Recommended Cleanup Order

1. **Phase 1: Extract Shared Components** (Week 1)
   - Create LoadingState, ErrorState, EmptyState
   - Create PageHeader, Pagination
   - Replace all instances

2. **Phase 2: Split Large Pages** (Week 2)
   - Split homepage into sections
   - Split cart, checkout, orders pages
   - Move inline components to separate files

3. **Phase 3: Server-Side Optimization** (Week 3)
   - Convert homepage to server-side
   - Optimize data fetching
   - Add proper loading states

4. **Phase 4: Folder Restructuring** (Week 4)
   - Reorganize components into proper folders
   - Move admin page components
   - Create shared UI component library

5. **Phase 5: Utilities & Constants** (Week 5)
   - Extract utilities
   - Extract constants
   - Standardize error handling

6. **Phase 6: New Features** (Week 6)
   - Add missing UI components
   - Improve accessibility
   - Add performance optimizations

---

## Notes

- This checklist is comprehensive and may take several weeks to complete
- Prioritize based on your immediate needs
- Some items can be done in parallel
- Test thoroughly after each major refactoring
- Consider creating feature branches for each phase

