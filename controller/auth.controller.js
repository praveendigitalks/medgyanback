import User from "../models/user.model.js";
import { Login , Logout, forgotPin, verifyResetPin} from "../service/auth.service.js";

export const LoginUser = async (req, res) => {
  try {
    const { identifier, pin, deviceId, deviceInfo } = req.body;

    /* -------- BASIC VALIDATION -------- */
    if (!identifier || !pin) {
      return res.status(400).json({
        success: false,
        message: "identifier and pin required"
      });
    }

    const result = await Login({
      identifier,
      pin,
      deviceId,
      deviceInfo
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
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
