import User from "../models/user.model.js";
import { Login , Logout} from "../service/auth.service.js";

export const LoginUser = async (req, res) => {
  try {
    const { identifier, pin, deviceId, deviceInfo } = req.body;
    
    // ✅ Only require deviceId for NON-super admin
    const user = await User.findOne({
      $or: [{ userName: identifier }, { email: identifier }]
    });
    
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    
    // ✅ Super admin: identifier + pin ONLY
    // ✅ Regular user: identifier + pin + deviceId
    if (!user.isSuperAdmin && !deviceId) {
      return res.status(400).json({ 
        message: "deviceId is required for regular users" 
      });
    }

    const loginResult = await Login({ 
      identifier, 
      pin, 
      deviceId,  // Can be undefined for super admin
      deviceInfo 
    });
    
    return res.status(200).json(loginResult);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const LogoutUser = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const result = await Logout({ userId });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
