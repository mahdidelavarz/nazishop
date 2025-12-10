# Order, Cart, and Payment Overview

This document describes the current cart, order, and mock payment flow, what users and admins can do, key routes/APIs, and how to connect a real gateway (Zibal) next.

## Capabilities
- User
  - Add/update/remove cart items; guest cart syncs on login.
  - Checkout: review cart, pick shipping method (UI), place order.
  - Mock payment: create a payment session, land on `/payment/[id]`, and mark success/failure.
  - View orders list and details (non-admin sees own orders).
- Admin
  - List all orders.
  - Update order status (pending → paid/cancelled → shipped → delivered).
  - Manage products (existing admin pages/APIs).

## Key Pages (App Router)
- Store
  - `/(store)/cart/page.tsx` – cart UI.
  - `/(store)/checkout/page.tsx` – checkout summary + shipping selection + pay button.
  - `/(store)/payment/[id]/page.tsx` – mock payment confirmation (marks success/failure).
  - `/(store)/orders` – (directory placeholder).
- Public
  - `/(public)/products/page.tsx` – product list.
  - `/(public)/products/[slug]/page.tsx` – product detail.
- Admin
  - `/(admin)/admin-orders/page.tsx` – orders list.
  - `/(admin)/admin-orders/[id]/page.tsx` – order detail/status update.
  - `/(admin)/admin-products/...` – product management.

## API Routes (server)
- Cart
  - `GET /api/cart` – list cart items (with product price/discount/thumbnail).
  - `POST /api/cart` – add item.
  - `PATCH /api/cart/[id]` – update quantity (stock-checked).
  - `DELETE /api/cart/[id]` – remove item.
  - `POST /api/cart/sync` – sync guest cart on login.
  - `GET /api/cart/summary` – count only.
- Orders
  - `POST /api/orders` – create order from cart items (inserts order + order_items, clears cart).
  - `GET /api/orders` – list orders (admin sees all; user sees own).
  - `GET /api/orders/[id]` – order detail with items.
  - `PATCH /api/orders/[id]/status` – admin status updates (pending→paid/cancelled, paid→shipped/cancelled, shipped→delivered).
- Payments (mock)
  - `POST /api/payments/create-session` – returns fake session with `payment_url: /payment/{orderId}`.
  - `POST /api/payments/verify` – sets order status to `paid` or `pending` based on payload.

## Data Model (DB)
- `products`: pricing with `discount_percent`, stock.
- `cart_items`: user_id, product_id, quantity.
- `orders`: user_id (nullable), total, status (`pending|paid|shipped|delivered|cancelled`), timestamps.
- `order_items`: order_id, product_id, quantity, price_at_purchase; trigger `stock_trigger` calls `update_stock()` to decrement inventory.

## Current Payment Behavior (Mock)
- Checkout calls `/api/orders` then `/api/payments/create-session`, which redirects to `/payment/{orderId}`.
- `/payment/[id]` lets the user mark success/failure; `/api/payments/verify` updates order status accordingly.
- No real gateway calls yet.

## Zibal Integration Plan (next step)
1. Env/config
   - Add `ZIBAL_MERCHANT` (and optional `ZIBAL_SANDBOX=true`).
   - Set callback URL, e.g. `https://your-domain.com/api/payments/verify`.
2. Create session (`/api/payments/create-session`)
   - Keep auth/ownership checks.
   - Call Zibal `POST /v1/request` with `{ merchant, amount, callbackUrl, orderId }`.
   - Receive `trackId`; set `payment_url = https://gateway.zibal.ir/start/{trackId}`.
   - Store `trackId`, `payment_provider='zibal'`, optional `payment_expires_at` on the order (add columns or a `payment_sessions` table).
   - Return the gateway URL to the client.
3. Verify (`/api/payments/verify`)
   - Zibal callback provides `success`, `trackId`, `orderId`.
   - If `success != 1`, mark fail (`pending`) and redirect user to a failure page.
   - Otherwise, call `POST /v1/verify` with `{ merchant, trackId }`.
   - If result code is success (100), set order `paid`; else set `pending/failed`.
   - Redirect user to `/orders/{id}?payment=success|failed` (or similar).
4. Frontend
   - On checkout, after `create-session`, `router.push(payment_url)` (Zibal page).
   - Optionally show a “Redirecting to gateway…” screen; handle return query params to display success/failure.
5. Edge cases
   - Amount must match `order.total` (Zibal expects Toman; convert if your prices are Rial).
   - Idempotency: if verify is called twice, don’t double-update; guard status transitions.
   - Expired sessions: if verify says expired, revert order to `pending`.

## Status Transitions
- User actions set: `pending` → `paid` (via verify success) or back to `pending` (verify fail).
- Admin actions: `pending|paid` → `shipped` → `delivered`; `pending|paid|shipped` → `cancelled`.

## Testing Checklist (current mock)
- Add item to cart; update quantity; remove item.
- Checkout with items: order row created, order_items populated, cart cleared.
- Mock pay success: order status becomes `paid`.
- Mock pay fail: order status reverts to `pending`.
- Admin changes status: pending→paid, paid→shipped→delivered, pending/paid/shipped→cancelled.

## Notes / Limitations
- Payment is mock-only until Zibal wiring is added.
- Orders currently store only `total` (no shipping fields); extend schema if needed.
- Order detail joins products for item display; ensure `products` table is present in the connected DB.

