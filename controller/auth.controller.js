import User from "../models/user.model.js";
import { Login , Logout, forgotPin, verifyResetPin} from "../service/auth.service.js";

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




// auth.controller.js - Add these to existing file

export const forgotPinController = async (req, res) => {
  try {
    const { identifier } = req.body;
    
    if (!identifier) {
      return res.status(400).json({ message: "identifier (username/email) required" });
    }

    const result = await forgotPin({ identifier });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const verifyResetPinController = async (req, res) => {
  try {
    const { identifier, resetPin, newPin } = req.body;

    if (!identifier || !resetPin || !newPin) {
      return res.status(400).json({
        message: "identifier, resetPin and newPin required"
      });
    }

    if (!/^\d{4,6}$/.test(newPin)) {
      return res.status(400).json({
        message: "New PIN must be 4-6 digits"
      });
    }

    const result = await verifyResetPin({
      identifier,
      resetPin,
      newPin
    });

    return res.status(200).json(result);
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
