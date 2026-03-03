import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  console.log('🔍 PROTECT: Starting auth check');

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.log('❌ PROTECT: No token');
    return res.status(401).json({ message: "No token" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('✅ PROTECT: Token decoded', { userId: decoded.id });

  const user = await User.findById(decoded.id);
  if (!user) {
    console.log('❌ PROTECT: User not found');
    return res.status(401).json({ message: "Invalid session" });
  }
  console.log('✅ PROTECT: User found', { userId: user._id, isSuperAdmin: user.isSuperAdmin });

  // 🔐 Simplified Device validation (NOT for super admin)
  if (!user.isSuperAdmin) {
    const deviceId = req.headers["x-device-id"];
    
    if (!deviceId) {
      console.log('❌ PROTECT: No deviceId header');
      return res.status(401).json({ message: "Device ID required" });
    }

    console.log('✅ PROTECT: Device validated', { deviceId: deviceId.substring(0, 20) + '...' });

    req.deviceId = deviceId;
  }

  req.user = user;
  req.tenantId = user.tenantId || null; // ✅ Use user.tenantId, not decoded (safer)
  
  console.log('✅ PROTECT: Auth passed');
  next();
};
