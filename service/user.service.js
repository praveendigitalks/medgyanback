import User from "../models/user.model.js";
import { hashPassword } from "../utils/password.js";
import {
  getUserSubscriptionStatus,
  getSubscriptionHistorySummary,
  getSubscriptionActionType,
} from "../utils/subscription.js";

// =============== CREATE ===============
export const createUser = async (data) => {
  data.pin = await hashPassword(data.pin);
  return User.create({ ...data });
};

// =============== LIST WITH FILTERS ===============
export const getUser = async (queryParams) => {
  let filter = {};

  if (queryParams.userName) {
    filter.userName = {
      $regex: queryParams.userName,
      $options: "i",
    };
  }

  if (queryParams.name) {
    filter.name = {
      $regex: queryParams.name,
      $options: "i",
    };
  }

  if (queryParams.email) {
    filter.email = {
      $regex: queryParams.email,
      $options: "i",
    };
  }

  let query = User.find(filter);

  if (queryParams.page) {
    const page = parseInt(queryParams.page);
    const limit = parseInt(queryParams.limit) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  return await query;
};

// =============== GET BY ID ===============
export const getUserbyId = async (id) => {
  return User.findById(id);
};

// =============== UPDATE (ADMIN-CONTROLLED SUBSCRIPTION) ===============
export const updateUser = async (id, data, adminUser = null) => {
  const session = await User.startSession();

  try {
    session.startTransaction();

    const user = await User.findById(id).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.isSuperAdmin) {
      throw new Error("Cannot modify super admin");
    }

    const oldSubscription = { ...(user.subscription || {}) };

    // ---------- BASIC FIELDS ----------
    const allowedUpdates = [
      "name",
      "contact_no",
      "deviceId",
      "device",
      "isBlocked",
      "resetPinToken",
      "resetPin",
      "resetPinExpires",
    ];

    allowedUpdates.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        user[field] = data[field];
      }
    });

    // ---------- SUBSCRIPTION GUARD LOGIC (ADMIN-ONLY CONTROL) ----------
    if (data.subscription) {
      const incoming = data.subscription;
      const current = user.subscription || {};
      const now = new Date();

      const currentPlan = current.subscription_plan || "TRIAL";
      const incomingPlan = incoming.subscription_plan || currentPlan;

      const currentStatus = current.status || "TRIAL";
      const currentExpiresAt = current.expiresAt ? new Date(current.expiresAt) : null;

      const hasActivePaid =
        currentPlan !== "TRIAL" &&
        currentStatus === "ACTIVE" &&
        currentExpiresAt &&
        currentExpiresAt > now;

      // 1) If user already has ACTIVE paid plan and admin sends same plan + same dates,
      //    skip subscription update (no duplicate log, no change).
      const samePlan =
        incomingPlan === currentPlan &&
        String(incoming.startDate || current.startDate || "") ===
          String(current.startDate || "") &&
        String(incoming.expiresAt || current.expiresAt || "") ===
          String(current.expiresAt || "");

      if (hasActivePaid && samePlan) {
        // do nothing, keep subscription as is
      } else {
        // 2) Otherwise, apply admin's explicit change
        //    Admin decides when to extend, upgrade, or expire — no auto logic here.
        user.subscription = {
          ...current,
          ...incoming,
        };

        // also ensure status is consistent with plan if you want:
        // e.g., if plan is TRIAL and admin forgot status, default to TRIAL
        if (!user.subscription.status) {
          user.subscription.status =
            user.subscription.subscription_plan === "TRIAL" ? "TRIAL" : "ACTIVE";
        }

        // ---------- LOG ENTRY (ONLY IF subscription actually changed) ----------
        if (adminUser) {
          const newPlan = user.subscription.subscription_plan;

          const newSubState = {
            status: user.subscription.status,
            subscription_plan: newPlan,
            startDate: user.subscription.startDate,
            expiresAt: user.subscription.expiresAt,
          };

          const oldSubState = {
            status: oldSubscription.status,
            subscription_plan: oldSubscription.subscription_plan,
            startDate: oldSubscription.startDate,
            expiresAt: oldSubscription.expiresAt,
          };

          const changed =
            oldSubState.status !== newSubState.status ||
            oldSubState.subscription_plan !== newSubState.subscription_plan ||
            String(oldSubState.startDate || "") !== String(newSubState.startDate || "") ||
            String(oldSubState.expiresAt || "") !== String(newSubState.expiresAt || "");

          if (changed) {
            await user.addSubscriptionLog({
              adminId: adminUser._id,
              adminName: adminUser.name || adminUser.userName,
              newPlan: user.subscription,
              accessType: data.subscriptionLog?.accessType || newPlan,
              notes: data.subscriptionLog?.notes || "",
              action:
                data.subscriptionLog?.action ||
                getSubscriptionActionType(oldSubscription, newPlan),
            });
          }
        }
      }
    }

    // ---------- OPTIONAL: manual log-only (no subscription change) ----------
    if (!data.subscription && data.subscriptionLog && adminUser) {
      await user.addSubscriptionLog({
        adminId: adminUser._id,
        adminName: adminUser.name || adminUser.userName,
        ...data.subscriptionLog,
        newPlan: user.subscription,
      });
    }

    // Save without re-validating all legacy fields (like old hashed pins)
    const updatedUser = await user.save({
      session,
      validateBeforeSave: false,
    });

    await session.commitTransaction();
    session.endSession();

    const status = getUserSubscriptionStatus(updatedUser);
    const history = getSubscriptionHistorySummary(updatedUser);

    return {
      ...updatedUser.toObject(),
      subscriptionStatus: status,
      subscriptionHistory: history,
    };
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (e) {
      // ignore abort error if already committed
    } finally {
      session.endSession();
    }
    throw error;
  }
};

// =============== BULK UPDATE (ADMIN) ===============
export const bulkUpdateUsers = async (userIds, updateData, adminUser) => {
  const session = await User.startSession();
  try {
    session.startTransaction();

    const results = [];
    for (const id of userIds) {
      try {
        const result = await updateUser(id, updateData, adminUser);
        results.push(result);
      } catch (err) {
        results.push({ id, error: err.message });
      }
    }

    await session.commitTransaction();
    return results;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// =============== DELETE ===============
export const deleteUser = async (id) => {
  return User.findByIdAndDelete(id);
};

// =============== DEVICE DELINK ===============
export const delinkUserDeviceService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.device = undefined;
  user.deviceId = undefined;

  await user.save();
  return user;
};

// =============== BLOCK / UNBLOCK ===============
export const blockUserService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.isBlocked = true;
  user.blockedAt = new Date();

  await user.save();
  return user;
};

export const unblockUserService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.isBlocked = false;
  user.blockedAt = null;

  await user.save();
  return user;
};
