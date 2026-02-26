import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export const createSuperAdmin = async () => {
  try {
    const exists = await User.findOne({ 
      $or: [{ isSuperAdmin: true }, { userName: "admin" }] 
    });

    if (exists) {
      console.log("ℹ️ Super admin already exists");
      return;
    }

    const hashedPin = await bcrypt.hash("admin@123", 10);

    await User.create({
      userName: "admin",
      name: "Super Admin",
      pin: hashedPin,
      email: "admin@gmail.com",
      isSuperAdmin: true,
      subscription: { status: 'ACTIVE', expiresAt: null }
      // ✅ No device needed - it's optional now
    });
    
    console.log("✅ Super admin created successfully");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};
