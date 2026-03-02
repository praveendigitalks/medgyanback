import User from "../models/user.model.js";

import bcrypt from "bcryptjs";
import { queryOptions } from "../constant/globalpagination.js";
import { hashPassword } from "../utils/password.js";
export const createUser = async (data) => {
  data.pin = await hashPassword(data.pin);
  return User.create({ ...data });
};

export const getUser = async (queryParams) => {
  let filter = {};

  // 🔎 Search by userName
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

  // Apply pagination
  if (queryParams.page) {
    const page = parseInt(queryParams.page);
    const limit = parseInt(queryParams.limit) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  return await query;
};





export const getUserbyId = async (id) => {
  return User.findById(id);
  //  .populate({
  //     path: "role",
  //     populate: {
  //       path: "permissions",
  //     },
  //   });;
};

export const updateUser = async (id, data) => {
  return User.findByIdAndUpdate(id, data, { new: true });
};

export const deleteUser = async (id) => {
  return User.findByIdAndDelete( id);
};


export const delinkUserDeviceService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) throw new Error("User not found");

  user.device = undefined;
  user.deviceId = undefined;

  await user.save();

  return user;
};

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
// logged  user devices

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