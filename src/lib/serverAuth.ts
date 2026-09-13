import { NextRequest, NextResponse } from 'next/server';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  role: 'user' | 'admin';
}

/**
 * Verifies the Firebase ID Token from the Authorization header (Bearer <token>).
 * Uses Google Identity Toolkit REST API with NEXT_PUBLIC_FIREBASE_API_KEY so it runs
 * in both Node.js and Edge runtimes without requiring a separate service account file.
 */
export async function verifyAuthToken(req: NextRequest): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const idToken = authHeader.slice(7).trim();
  if (!idToken) return null;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    console.warn('NEXT_PUBLIC_FIREBASE_API_KEY is not defined; cannot verify ID token.');
    return null;
  }

  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json() as { users?: Array<{ localId: string; email?: string }> };
    const user = data.users?.[0];
    if (!user || !user.localId) return null;

    const email = user.email?.toLowerCase().trim();
    const isAdmin = email === 'carstenlysdal@gmail.com';

    return {
      uid: user.localId,
      email,
      role: isAdmin ? 'admin' : 'user',
    };
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
}

/**
 * Enforces that a request must be authenticated by a valid user.
 */
export async function requireAuth(req: NextRequest): Promise<
  { user: AuthenticatedUser; errorResponse?: never } | { user?: never; errorResponse: NextResponse }
> {
  const user = await verifyAuthToken(req);
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Du skal være logget ind for at udføre denne handling.' },
        { status: 401 }
      ),
    };
  }
  return { user };
}

/**
 * Enforces that a request must have an admin role.
 */
export async function requireAdmin(req: NextRequest): Promise<
  { user: AuthenticatedUser; errorResponse?: never } | { user?: never; errorResponse: NextResponse }
> {
  const user = await verifyAuthToken(req);
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Uautoriseret: Log venligst ind som administrator.' },
        { status: 401 }
      ),
    };
  }

  if (user.role !== 'admin') {
    return {
      errorResponse: NextResponse.json(
        { error: 'Adgang nægtet: Kræver administratorrettigheder.' },
        { status: 403 }
      ),
    };
  }

  return { user };
}
