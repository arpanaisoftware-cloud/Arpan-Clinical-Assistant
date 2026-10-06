import bcrypt from 'bcryptjs';
import User from '@/models/User';

export async function ensureDefaultUsers() {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Seeding initial default staff users into MongoDB...');
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
        },
        {
          name: 'Nurse Alex Rivera',
          email: 'alex.rivera@arpanclinical.org',
          password: await bcrypt.hash('staff123', 10),
          staffId: 'STAFF-8921',
          department: 'Diabetic & Chronic Care',
          role: 'Staff',
          modulePermissions: 'Counselling + Diets',
          active: true
        },
        {
          name: 'Dietitian Priya Sharma',
          email: 'priya.sharma@arpanclinical.org',
          password: await bcrypt.hash('staff123', 10),
          staffId: 'STAFF-4402',
          department: 'Clinical Nutrition & Metabolic Health',
          role: 'Staff',
          modulePermissions: 'Diets Only',
          active: true
        }
      ];

      await User.insertMany(seedUsers);
      console.log('Default staff seeded successfully.');
    }
  } catch (err) {
    console.warn('Auto-seed check encountered non-fatal error:', err);
  }
}
