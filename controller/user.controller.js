import User from "../models/user.model.js";
import {
  createUser,
  getUser,
  getUserbyId,
  updateUser,
  deleteUser,
  delinkUserDeviceService,
  blockUserService,
  unblockUserService,
  bulkUpdateUsers,
} from "../service/user.service.js";

// =============== CREATE ===============
export const CreateUserController = async (req, res) => {
  try {
    const user = await createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// =============== LIST WITH PAGINATION ===============
export const GetUserController = async (req, res) => {
  try {
    const users = await getUser(req.query);
    const total = await User.countDocuments({}); // or use same filter if needed

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users,
      pagination: {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        total,
        pages: Math.ceil(total / (parseInt(req.query.limit) || 10)),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// =============== GET BY ID ===============
export const GetUserControllerByid = async (req, res) => {
  try {
    const user = await getUserbyId(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// =============== UPDATE (ADMIN ONLY) ===============
export const updateUserController = async (req, res) => {
  try {
    const adminUser = req.user; // set by protect middleware

    if (!adminUser || !adminUser.isSuperAdmin) {
      return res.status(403).json({
        error: "Admin access required",
      });
    }

    const updatedUser = await updateUser(req.params.id, req.body, adminUser);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      error: error.message || "Update failed",
    });
  }
};


// =============== BULK UPDATE (ADMIN ONLY) ===============
export const bulkUpdateUsersController = async (req, res) => {
  try {
    const adminUser = req.user;

    if (!adminUser?.isSuperAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const userIds = req.body.userIds || [];
    const updateData = req.body.updateData || {};

    if (userIds.length === 0) {
      return res.status(400).json({ error: "No user IDs provided" });
    }

    if (userIds.length > 50) {
      return res
        .status(400)
        .json({ error: "Max 50 users per bulk update" });
    }

    const results = await bulkUpdateUsers(userIds, updateData, adminUser);

    return res.status(200).json({
      success: true,
      message: `${results.length} users processed`,
      results,
    });
  } catch (error) {
    console.error("Bulk update error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// =============== EXTEND SUBSCRIPTION (ADMIN ONLY) ===============
export const extendSubscriptionController = async (req, res) => {
  try {
    const adminUser = req.user;
    if (!adminUser || !adminUser.isSuperAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;
    const { expiresAt, subscription_plan = "BASIC" } = req.body;

    const updateData = {
      subscription: {
        status: "ACTIVE",
        subscription_plan,
        expiresAt: new Date(expiresAt),
      },
      subscriptionLog: {
        accessType: subscription_plan,
        notes: `Extended by ${adminUser.name || adminUser.userName}`,
        action: "EXTENDED",
      },
    };

    const updatedUser = await updateUser(id, updateData, adminUser);

    return res.status(200).json({
      success: true,
      message: "Subscription extended successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Extend subscription error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// =============== DELETE ===============
export const deleteUserController = async (req, res) => {
  try {
    const user = await deleteUser(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// =============== DELINK DEVICE ===============
export const delinkUserDeviceController = async (req, res) => {
  try {
    await delinkUserDeviceService(req.params.id);

    return res.status(200).json({
      success: true,
      message:
        "Device removed successfully. User can login from new device.",
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// =============== BLOCK / UNBLOCK ===============
export const blockUserController = async (req, res) => {
  try {
    await blockUserService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User blocked successfully",
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const unblockUserController = async (req, res) => {
  try {
    await unblockUserService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully",
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
