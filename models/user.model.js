import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  isSuperAdmin: {
    type: Boolean,
    default: false,
  },
  userName: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: String,
  contact_no: Number,
  pin: {
    type: String,
    required: true
  },
  deviceId: String,  // ✅ Optional
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // ✅ Make entire device object OPTIONAL
  device: {
    deviceId: String,        // ✅ Removed required
    deviceName: String,
    browser: String,
    os: String,
    deviceType: String,
    userAgent: String,
    token: String,
    lastLogin: Date
  },
  subscription: {
    status: {
      type: String,
      enum: ['TRIAL', 'ACTIVE', 'EXPIRED'],
      default: 'TRIAL'
    },
    expiresAt: Date
  },
  tenantId: mongoose.Schema.Types.ObjectId
}, { 
  timestamps: true 
});

export default mongoose.model("User", userSchema);
