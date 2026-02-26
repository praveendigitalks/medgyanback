import User from "../models/user.model.js";

export const protect = async (req, res, next) => {

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) return res.status(401).json({ message: "Invalid session" });

  // 🔐 Device validation (NOT for super admin)
  if (!user.isSuperAdmin) {
    const deviceId = req.headers["x-device-id"];

    const validDevice = user.devices.find(
      d => d.deviceId === deviceId && d.token === token
    );

    if (!validDevice) {
      return res.status(401).json({ message: "Device logged out" });
    }

    req.deviceId = deviceId;
  }

  req.user = user;
  req.tenantId = decoded.tenantId;

  next();
};