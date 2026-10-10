import bcrypt from 'bcryptjs';
import User from '@/models/User';

export async function ensureDefaultUsers() {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Seeding initial default doctor into MongoDB...');
      const seedUsers = [
        {
          name: 'Dr. Yashwant Dubey',
          email: 'dr.yashwant@arpanclinical.org',
          password: await bcrypt.hash('00000000', 10),
          staffId: 'DOC-8849',
          department: 'Chief Cardiology & Internal Medicine',
          role: 'Doctor',
          modulePermissions: 'Full Access',
          active: true
        }
      ];

      await User.insertMany(seedUsers);
      console.log('Default doctor seeded successfully.');
    }
  } catch (err) {
    console.warn('Auto-seed check encountered non-fatal error:', err);
  }
}
