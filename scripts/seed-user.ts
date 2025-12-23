import "dotenv/config";
import { db } from "../app/db/client";
import { auth } from "../app/lib/auth.server";
import { serializeRoles, type Role } from "../app/lib/roles";

async function seedUser() {
  const email = "admin@example.com";
  const password = "admin";
  const name = "Admin";
  const roles: Role[] = ["user", "admin"];

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    // Update roles and password if user exists
    const ctx = await auth.$context;
    const hashedPassword = await ctx.password.hash(password);

    await db.user.update({
      where: { email },
      data: { roles: serializeRoles(roles) },
    });

    await db.account.updateMany({
      where: { userId: existingUser.id, providerId: "credential" },
      data: { password: hashedPassword },
    });

    console.log(`User ${email} already exists. Updated roles and password.`);
    return;
  }

  // Use BetterAuth's internal context to hash password
  const ctx = await auth.$context;
  const hashedPassword = await ctx.password.hash(password);

  // Generate unique IDs
  const userId = crypto.randomUUID();
  const accountId = crypto.randomUUID();

  // Create user
  await db.user.create({
    data: {
      id: userId,
      email,
      name,
      roles: serializeRoles(roles),
      emailVerified: true,
    },
  });

  // Create account with hashed password
  await db.account.create({
    data: {
      id: accountId,
      userId,
      accountId: userId,
      providerId: "credential",
      password: hashedPassword,
    },
  });

  console.log(`Created user: ${email} with password: ${password} (roles: ${roles.join(", ")})`);
}

seedUser()
  .catch(console.error)
  .finally(() => process.exit(0));
