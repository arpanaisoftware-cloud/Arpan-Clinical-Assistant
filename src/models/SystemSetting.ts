import mongoose from 'mongoose';

export interface ISystemSetting {
  key: string;
  value: string;
  description?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const SystemSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    description: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.SystemSetting || mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);
