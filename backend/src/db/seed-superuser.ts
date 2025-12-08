import bcrypt from 'bcrypt';
import * as studentRepo from '../repositories/student.repository';

const SALT_ROUNDS = 10;

export async function seedSuperuser(): Promise<void> {
  const email = process.env.SUPERUSER_EMAIL;
  const password = process.env.SUPERUSER_PASSWORD;
  const name = process.env.SUPERUSER_NAME || 'Super Admin';

  // Skip if environment variables are not set
  if (!email || !password) {
    console.log('Superuser seeding skipped: SUPERUSER_EMAIL and SUPERUSER_PASSWORD not set');
    return;
  }

  try {
    // Check if superuser already exists
    const existing = await studentRepo.findSuperuserByEmail(email);
    if (existing) {
      console.log(`Superuser already exists: ${email}`);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create superuser
    const superuser = await studentRepo.createSuperuser(email, name, passwordHash);
    console.log(`Superuser created: ${superuser.email}`);
  } catch (error) {
    console.error('Error seeding superuser:', error);
  }
}
