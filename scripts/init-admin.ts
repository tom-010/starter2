import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { users } from '../app/db/schema';
import * as schema from '../app/db/schema';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function initializeAdmin() {
  const dbPath = process.env.DB_PATH || './db/app.db';
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite, { schema });

  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  const adminName = 'Admin User';

  try {
    // Check if admin already exists
    const { eq } = await import('drizzle-orm');
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log('✓ Admin user already exists');
      return;
    }

    const hashedPassword = await hashPassword(adminPassword);
    const adminId = crypto.randomUUID();

    await db.insert(users).values({
      id: adminId,
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: 'admin',
      emailVerified: true,
    });

    console.log('✓ Admin user created successfully');
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('  ⚠️  Change this password immediately after logging in!');
  } catch (error) {
    console.error('Failed to initialize admin:', error);
    process.exit(1);
  } finally {
    sqlite.close();
  }
}

initializeAdmin();
