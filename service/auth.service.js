
import User from "./../models/user.model.js";
import { comparePassword, hashPassword } from "./../utils/password.js";
import { generateJsonWebToken } from "./../utils/jwt.js";
import { generateResetPinToken, sendResetPinEmail, verifyResetPinToken } from "../mail/resetPin.js";
import { getUserSubscriptionStatus } from "../utils/subscription.js";

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
  // ✅ NEW — compute subscription meta
const subscriptionMeta = getUserSubscriptionStatus(user);

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

  // return {
  //   token,
  //   user: {
  //     _id: user._id,
  //     userName: user.userName,
  //     email: user.email,
  //     name: user.name,
  //     isSuperAdmin: user.isSuperAdmin,
  //   },
  //   device: user.isSuperAdmin ? null : user.device,  // ✅ Super admin returns null device
  // };

  return {
  token,
  user: {
    _id: user._id,
    userName: user.userName,
    email: user.email,
    name: user.name,
    isSuperAdmin: user.isSuperAdmin,
  },
  device: user.isSuperAdmin ? null : user.device,

  // 🔥 ADD THIS BLOCK (VERY IMPORTANT)
  subscription: subscriptionMeta
};
};





// export const forgotPin = async ({ identifier }) => {
//   const user = await User.findOne({
//     $or: [
//       { userName: identifier },
//       { email: identifier }
//     ]
//   });

//   if (!user) {
//     // Don't reveal if user exists (security)
//     throw new Error("If account exists, check your email for instructions");
//   }

//   // Generate 6-digit PIN
//   const resetPin = Math.floor(100000 + Math.random() * 900000).toString();
  
//   // Create reset token (expires in 15 mins)
//   const resetToken = generateResetPinToken({ 
//     userId: user._id, 
//     pin: resetPin 
//   });

//   // Save to user
//   user.resetPinToken = resetToken;
//   user.resetPinExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
//   await user.save();

//   // Send email
//   await sendResetPinEmail({
//     to: user.email,
//     resetPin,
//     userName: user.userName
//   });

//   return { 
//     message: "Reset PIN sent to your email. Valid for 15 minutes." 
//   };
// };
export const forgotPin = async ({ identifier }) => {
  const user = await User.findOne({
    $or: [{ userName: identifier }, { email: identifier }]
  });

  if (!user) {
    throw new Error("If account exists, check your email for instructions");
  }

  // ✅ generate PIN
  const resetPin = Math.floor(100000 + Math.random() * 900000).toString();

  // ✅ SAVE PIN (THIS WAS MISSING)
  user.resetPin = resetPin;
  user.resetPinExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  // ✅ send email
  await sendResetPinEmail({
    to: user.email,
    resetPin,
    userName: user.userName
  });

  return {
    message: "Reset PIN sent to your email. Valid for 15 minutes."
  };
};
// export const verifyResetPin = async ({ identifier, resetPin, newPin }) => {
//   const user = await User.findOne({
//     $or: [{ userName: identifier }, { email: identifier }],
//     resetPin,
//     resetPinExpires: { $gt: new Date() }
//   });

//   if (!user) {
//     throw new Error("Invalid or expired reset PIN");
//   }

//   const hashedPin = await hashPassword(newPin);

//   user.pin = hashedPin;
//   user.resetPin = null;
//   user.resetPinExpires = null;
//   await user.save();

//   return { message: "PIN reset successfully. Please login." };
// };
export const verifyResetPin = async ({ identifier, resetPin, newPin }) => {
  // normalize inputs
  const cleanIdentifier = identifier.toLowerCase().trim();
  const cleanPin = resetPin.toString().trim();

  const user = await User.findOne({
    $or: [
      { userName: cleanIdentifier },
      { email: cleanIdentifier }
    ]
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 🔥 DEBUG (remove later)
  console.log("Entered PIN:", cleanPin);
  console.log("DB PIN:", user.resetPin);
  console.log("Expiry:", user.resetPinExpires);
  console.log("Now:", new Date());

  // ✅ PIN match check
  if (user.resetPin !== cleanPin) {
    throw new Error("Invalid reset PIN");
  }

  // ✅ expiry check
  if (!user.resetPinExpires || user.resetPinExpires < new Date()) {
    throw new Error("Reset PIN expired");
  }

  // ✅ update new PIN
  const hashedPin = await hashPassword(newPin);
  user.pin = hashedPin;

  // ✅ clear reset fields
  user.resetPin = null;
  user.resetPinExpires = null;

  await user.save();

  return { message: "PIN reset successfully. Please login." };
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
