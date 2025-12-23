import "dotenv/config";
import { db } from "../app/db/client";
import { auth } from "../app/lib/auth.server";

const command = process.argv[2];

async function listUsers() {
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (users.length === 0) {
    console.log("No users found.");
    return;
  }

  console.log("\nUsers:");
  console.log("-".repeat(60));
  for (const user of users) {
    console.log(`  Email: ${user.email}`);
    console.log(`  Name:  ${user.name}`);
    console.log(`  ID:    ${user.id}`);
    console.log("-".repeat(60));
  }
  console.log(`Total: ${users.length} user(s)\n`);
}

async function createUser() {
  const email = process.argv[3];
  const password = process.argv[4];
  const name = process.argv[5] || email.split("@")[0];

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/manage-users.ts create <email> <password> [name]");
    process.exit(1);
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`User ${email} already exists.`);
    process.exit(1);
  }

  const ctx = await auth.$context;
  const hashedPassword = await ctx.password.hash(password);

  const userId = crypto.randomUUID();
  const accountId = crypto.randomUUID();

  await db.user.create({
    data: {
      id: userId,
      email,
      name,
      emailVerified: true,
    },
  });

  await db.account.create({
    data: {
      id: accountId,
      userId,
      accountId: userId,
      providerId: "credential",
      password: hashedPassword,
    },
  });

  console.log(`Created user: ${email}`);
}

async function updateUser() {
  const email = process.argv[3];
  const field = process.argv[4];
  const value = process.argv[5];

  if (!email || !field || !value) {
    console.error("Usage: npx tsx scripts/manage-users.ts update <email> <field> <value>");
    console.error("Fields: name, email, password");
    process.exit(1);
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User ${email} not found.`);
    process.exit(1);
  }

  switch (field) {
    case "name":
      await db.user.update({ where: { email }, data: { name: value } });
      console.log(`Updated name for ${email} to: ${value}`);
      break;

    case "email":
      await db.user.update({ where: { email }, data: { email: value } });
      console.log(`Updated email from ${email} to: ${value}`);
      break;

    case "password":
      const ctx = await auth.$context;
      const hashedPassword = await ctx.password.hash(value);
      await db.account.updateMany({
        where: { userId: user.id, providerId: "credential" },
        data: { password: hashedPassword },
      });
      console.log(`Updated password for ${email}`);
      break;

    default:
      console.error(`Unknown field: ${field}. Use: name, email, password`);
      process.exit(1);
  }
}

async function deleteUser() {
  const email = process.argv[3];

  if (!email) {
    console.error("Usage: npx tsx scripts/manage-users.ts delete <email>");
    process.exit(1);
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User ${email} not found.`);
    process.exit(1);
  }

  await db.user.delete({ where: { email } });
  console.log(`Deleted user: ${email}`);
}

function showHelp() {
  console.log(`
User Management CLI

Usage:
  npx tsx scripts/manage-users.ts <command> [options]

Commands:
  list                              List all users
  create <email> <password> [name]  Create a new user
  update <email> <field> <value>    Update a user (fields: name, email, password)
  delete <email>                    Delete a user

Examples:
  npx tsx scripts/manage-users.ts list
  npx tsx scripts/manage-users.ts create user@example.com mypassword "John Doe"
  npx tsx scripts/manage-users.ts update user@example.com name "Jane Doe"
  npx tsx scripts/manage-users.ts update user@example.com password newpassword
  npx tsx scripts/manage-users.ts delete user@example.com
`);
}

async function main() {
  switch (command) {
    case "list":
      await listUsers();
      break;
    case "create":
      await createUser();
      break;
    case "update":
      await updateUser();
      break;
    case "delete":
      await deleteUser();
      break;
    default:
      showHelp();
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
