import { hasPassword } from "../utils/password.js";
import User from "../models/user.model.js";

import bcrypt from "bcryptjs";
export const createUser = async (data, tenantId) => {
  data.password = await hasPassword(data.password);
  return User.create({ ...data, tenantId });
};

export const getUser = async (tenantId) => {
  // Expects STRING
  return User.find() // ✅ { tenantId: "6979..." }
    
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

// logged  user devices

