import { db } from "../db/client";
import { sessions, users } from "../db/schema";
import { eq } from "drizzle-orm";

export async function getSession(token: string) {
  const session = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);

  if (!session.length) return null;
  if (session[0].session.expiresAt < Date.now()) return null;

  return {
    user: session[0].user,
    session: session[0].session,
  };
}

export async function getCurrentUser(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  // Extract auth token from cookies
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((c) => c.split("="))
  );

  const token = cookies["better-auth.session_token"];
  if (!token) return null;

  const session = await getSession(token);
  return session?.user || null;
}

export async function getAllUsers() {
  return await db.select().from(users);
}

export async function getUserById(id: string) {
  return await db.select().from(users).where(eq(users.id, id)).limit(1);
}

export async function updateUserRole(userId: string, role: "user" | "admin") {
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function deleteUser(userId: string) {
  await db.delete(users).where(eq(users.id, userId));
}

export async function createAdminUser(
  email: string,
  password: string,
  name: string
) {
  const userId = crypto.randomUUID();

  // Hash password (in production, use a proper password hashing library)
  const hashedPassword = await hashPassword(password);

  await db.insert(users).values({
    id: userId,
    email,
    name,
    password: hashedPassword,
    role: "admin",
    emailVerified: true,
  });

  return userId;
}

// Simple password hashing function (use bcrypt or argon2 in production)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
