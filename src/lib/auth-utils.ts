import { auth } from "@/auth";

/**
 * Verifies that the current user session is active and has the ADMIN role.
 * Returns the session object on success, or null if unauthorized.
 */
export async function verifyAdmin() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}
