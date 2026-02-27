import { hasPassword } from "../utils/password.js";
import User from "../models/user.model.js";

import bcrypt from "bcryptjs";
export const createUser = async (data) => {
  data.pin = await hasPassword(data.pin);
  return User.create({ ...data });
};

export const getUser = async () => {
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

