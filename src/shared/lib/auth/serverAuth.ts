import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/shared/lib/jwt/jwt';
import { supabaseAdmin } from '@/shared/lib/supabase/server';
import type { User } from '@/features/auth/types/auth.type';

/**
 * Get currently authenticated user from accessToken cookie.
 * Returns null if no valid token or user not found.
 */
export async function getAuthUser(req: NextRequest): Promise<User | null> {
  const accessToken = req.cookies.get('accessToken')?.value;
  if (!accessToken) return null;

  const payload = verifyAccessToken(accessToken);
  if (!payload) return null;

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', payload.userId)
    .single();

  if (error || !user) {
    console.error('getAuthUser: user lookup failed', error);
    return null;
  }

  return user as User;
}

export type RequireUserResult = {
  user: User | null;
  response: NextResponse | null;
};

/**
 * Ensure a valid authenticated user exists.
 * If not, returns a 401 response; otherwise returns the user.
 */
export async function requireUser(req: NextRequest): Promise<RequireUserResult> {
  const user = await getAuthUser(req);

  if (!user) {
    const response = NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );

    return { user: null, response };
  }

  return { user, response: null };
}

/**
 * Ensure current user is authenticated and has admin role.
 * Returns 401 if not logged in, 403 if not admin.
 */
export async function requireAdmin(
  req: NextRequest
): Promise<RequireUserResult> {
  const { user, response } = await requireUser(req);

  // Already unauthorized
  if (response || !user) {
    return { user: null, response };
  }

  if (user.role !== 'admin') {
    const forbidden = NextResponse.json(
      { success: false, message: 'Forbidden' },
      { status: 403 }
    );

    return { user: null, response: forbidden };
  }

  return { user, response: null };
}
