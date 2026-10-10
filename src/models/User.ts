import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    staffId: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    role: { type: String, enum: ['Doctor', 'Staff'], default: 'Staff' },
    modulePermissions: {
      type: String,
      enum: ['Counselling Only', 'Diets Only', 'Counselling + Diets', 'Full Access'],
      default: 'Full Access',
    },
    active: { type: Boolean, default: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    activeSessionId: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
