
import User from "./../models/user.model.js";
import { comparePassword, hashPassword } from "./../utils/password.js";
import { generateJsonWebToken } from "./../utils/jwt.js";
import { generateResetPinToken, sendResetPinEmail, verifyResetPinToken } from "../mail/resetPin.js";
import { getUserSubscriptionStatus } from "../utils/subscription.js";

// export const Login = async ({ identifier, pin, deviceId, deviceInfo = {} }) => {
//   /* ---------------- FIND USER ---------------- */
//   const user = await User.findOne({
//     $or: [
//       { userName: identifier.toLowerCase().trim() },
//       { email: identifier.toLowerCase().trim() }
//     ]
//   });

//   if (!user) {
//     throw new Error("User not found");
//   }

//   /* ---------------- BLOCK CHECK ---------------- */
//   if (user.isBlocked) {
//     throw new Error("Your account has been blocked by admin.");
//   }

//   /* ---------------- PASSWORD CHECK ---------------- */
//   const match = await comparePassword(pin, user.pin);
//   if (!match) {
//     throw new Error("Invalid credentials");
//   }

//   /* ---------------- SUBSCRIPTION CHECK ---------------- */
//   if (!user.isSuperAdmin) {
//     const now = new Date();
//     const sub = user.subscription || {};

//     if (sub.status !== "ACTIVE" && sub.status !== "TRIAL") {
//       throw new Error("Subscription inactive");
//     }

//     if (sub.expiresAt && sub.expiresAt < now) {
//       throw new Error("Subscription expired");
//     }
//   }

//   /* ---------------- GENERATE TOKEN ---------------- */
//   const token = generateJsonWebToken(user);

//   /* ---------------- SINGLE DEVICE LOGIC → MULTI DEVICE ARRAY ✅ ---------------- */
//   if (!user.isSuperAdmin) {
//     if (!deviceId) {
//       throw new Error("deviceId required");
//     }

//     // ✅ FIX 1: Initialize devices array if undefined
//     if (!user.devices) {
//       user.devices = [];
//     }

//     // ✅ FIX 2: Remove old device with same deviceId (logout old sessions)
//     user.devices = user.devices.filter(d => d.deviceId !== deviceId);

//     // ✅ FIX 3: Add/update current device
//     const deviceData = {
//       deviceId,
//       deviceName: deviceInfo.deviceName || "Unknown",
//       browser: deviceInfo.browser || "Unknown",
//       os: deviceInfo.os || "Unknown",
//       deviceType: deviceInfo.deviceType || "Unknown",
//       userAgent: deviceInfo.userAgent || "",
//       token,  // ✅ JWT token for protect middleware validation
//       lastLogin: new Date(),
//     };

//     user.devices.push(deviceData);
    
//     // ✅ FIX 4: Save to MongoDB (CRITICAL - makes user.devices available in protect)
//     await user.save();
//   }

//   /* ---------------- SUBSCRIPTION META - CORRECTED ✅ ---------------- */
//   const sub = user.subscription || {};

//   const subscriptionResponse = {
//     status: sub.status || "TRIAL",
//     subscription_plan: sub.subscription_plan || "TRIAL",
//     startDate: sub.startDate,
//     expiresAt: sub.expiresAt,
//     expiryNotified: sub.expiryNotified || false,
//     canPurchase: sub.status !== "ACTIVE",
//     daysLeft: user.daysRemaining || 0,
//     isExpiringSoon: (user.daysRemaining || 0) <= 7 && (user.daysRemaining || 0) > 0
//   };

//   return {
//     token,
//     user: {
//       _id: user._id,
//       userName: user.userName,
//       email: user.email,
//       name: user.name,
//       isSuperAdmin: user.isSuperAdmin,
//     },
//     device: user.isSuperAdmin ? null : user.devices?.[0] || null,  // ✅ Return first device for response
//     subscription: subscriptionResponse
//   };
// };





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

export const Login = async ({ identifier, pin, deviceId, deviceInfo = {} }) => {
  console.log("🔐 LOGIN STARTED", { identifier, hasDeviceId: !!deviceId });

  /* ---------------- FIND USER ---------------- */
  const normalizedIdentifier = identifier.toLowerCase().trim();

  const user = await User.findOne({
    $or: [{ userName: normalizedIdentifier }, { email: normalizedIdentifier }],
  });

  if (!user) {
    console.log("❌ User not found");
    throw new Error("User not found");
  }
  console.log("✅ User found", {
    userId: user._id,
    isSuperAdmin: user.isSuperAdmin,
    hasDevice: !!user.device,
  });

  /* ---------------- BLOCK CHECK ---------------- */
  if (user.isBlocked) {
    console.log("❌ User blocked");
    throw new Error("Your account has been blocked by admin.");
  }

  /* ---------------- PASSWORD CHECK ---------------- */
  const match = await comparePassword(pin, user.pin);
  if (!match) {
    console.log("❌ Invalid credentials");
    throw new Error("Invalid credentials");
  }
  console.log("✅ Password match");

  /* ---------------- SUBSCRIPTION CHECK ---------------- */
  if (!user.isSuperAdmin) {
    const now = new Date();
    const sub = user.subscription || {};
    console.log("📋 Subscription check", {
      status: sub.status,
      expiresAt: sub.expiresAt,
    });

    if (sub.status !== "ACTIVE" && sub.status !== "TRIAL") {
      console.log("❌ Subscription inactive");
      throw new Error("Subscription inactive");
    }

    if (sub.expiresAt && sub.expiresAt < now) {
      console.log("❌ Subscription expired");
      throw new Error("Subscription expired");
    }
    console.log("✅ Subscription valid");
  }

  /* ---------------- DEVICE LOCK CHECK ---------------- */
  if (!user.isSuperAdmin) {
    if (!deviceId) {
      console.log("❌ No deviceId provided");
      throw new Error("deviceId required");
    }

    console.log("📱 Incoming device", {
      deviceIdPreview: deviceId.substring(0, 20) + "...",
    });

    // If user already has a device locked, block all further logins
    if (user.device && user.device.deviceId) {
      if (user.device.deviceId === deviceId) {
        console.log("❌ Same device trying to login again");
        throw new Error("You are already logged in on this device.");
      }

      console.log("❌ Different device trying to login while one is active");
      throw new Error(
        "Your account is already active on another device. Contact admin to reset device."
      );
    }
  }

  /* ---------------- GENERATE TOKEN ---------------- */
  const token = generateJsonWebToken(user);
  console.log("🔑 Token generated");

  /* ---------------- SAVE DEVICE (FIRST TIME ONLY) ---------------- */
  if (!user.isSuperAdmin) {
    const deviceData = {
      deviceId,
      deviceName: deviceInfo.deviceName || "Unknown",
      browser: deviceInfo.browser || "Unknown",
      os: deviceInfo.os || "Unknown",
      deviceType: deviceInfo.deviceType || "Unknown",
      userAgent: deviceInfo.userAgent || "",
      token, // used by protect middleware
      lastLogin: new Date(),
    };

    user.device = deviceData;
    await user.save();
    console.log("💾 User saved with device lock", {
      userId: user._id,
      deviceId: user.device.deviceId,
    });
  }

  /* ---------------- SUBSCRIPTION META ---------------- */
  const sub = user.subscription || {};
  const subscriptionResponse = {
    status: sub.status || "TRIAL",
    subscription_plan: sub.subscription_plan || "TRIAL",
    startDate: sub.startDate,
    expiresAt: sub.expiresAt,
    expiryNotified: sub.expiryNotified || false,
    canPurchase: sub.status !== "ACTIVE",
    daysLeft: user.daysRemaining || 0,
    isExpiringSoon:
      (user.daysRemaining || 0) <= 7 && (user.daysRemaining || 0) > 0,
  };

  /* ---------------- RESPONSE ---------------- */
  const response = {
    token,
    user: {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      name: user.name,
      isSuperAdmin: user.isSuperAdmin,
    },
    device: user.isSuperAdmin ? null : user.device || null,
    subscription: subscriptionResponse,
  };

  console.log("✅ LOGIN SUCCESSFUL", {
    userId: user._id,
    hasDevice: !!user.device,
    subscriptionPlan: subscriptionResponse.subscription_plan,
  });

  return response;
};



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
