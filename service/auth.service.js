
import User from "./../models/user.model.js";
import { comparePassword } from "./../utils/password.js";
import { generateJsonWebToken } from "./../utils/jwt.js";

export const Login = async ({ identifier, pin, deviceId, deviceInfo = {} }) => {
  const user = await User.findOne({
    $or: [
      { userName: identifier },
      { email: identifier }
    ]
  });

  if (!user) throw new Error("User not found");

  const match = await comparePassword(pin, user.pin);
  if (!match) throw new Error("Invalid credentials");

  // Subscription check (super admin bypass) ✅
  if (!user.isSuperAdmin) {
    const now = new Date();
    const sub = user.subscription;
    if (sub.status !== 'ACTIVE' && sub.status !== 'TRIAL') {
      throw new Error("Subscription inactive");
    }
    if (sub.expiresAt && sub.expiresAt < now) {
      throw new Error("Subscription expired");
    }
  }

  const token = generateJsonWebToken(user);

  /* ---------------- SINGLE DEVICE (Super Admin SKIP) ---------------- */
  if (deviceId && !user.isSuperAdmin) {  // ✅ Super admin skips device management
    if (!user.device || user.device.deviceId !== deviceId) {
      user.device = {
        deviceId,
        deviceName: deviceInfo.deviceName || 'Unknown',
        browser: deviceInfo.browser || 'Unknown',
        os: deviceInfo.os || 'Unknown',
        deviceType: deviceInfo.deviceType || 'Unknown',
        userAgent: deviceInfo.userAgent || '',
        token,
        lastLogin: new Date(),
      };
      user.deviceId = deviceId;
    } else {
      user.device.token = token;
      user.device.lastLogin = new Date();
    }
    await user.save();
  }

  return {
    token,
    user: {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      name: user.name,
      isSuperAdmin: user.isSuperAdmin,
    },
    device: user.isSuperAdmin ? null : user.device,  // ✅ Super admin returns null device
  };
};






export const Logout = async ({ userId, deviceId }) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const before = user.devices.length;

  user.devices = user.devices.filter((d) => d.deviceId !== deviceId);

  if (before === user.devices.length) {
    throw new Error("Device already logged out");
  }

  await user.save();
};
