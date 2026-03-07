import express from "express";
import {
  CreateUserController,
  GetUserController,
  GetUserControllerByid,
  updateUserController,
  deleteUserController,
  delinkUserDeviceController,
  blockUserController,
  unblockUserController,
  bulkUpdateUsersController,
  extendSubscriptionController,
  changeMyPasswordController
} from "../controller/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { queryOptions } from "../constant/globalpagination.js";
import User from "../models/user.model.js";

const router = express.Router();

// Public / semi-public routes
router.post("/", CreateUserController);
router.get("/", queryOptions(User), GetUserController);
router.get("/:id", GetUserControllerByid);

// Admin-protected user updates
router.put("/:id", protect, updateUserController);
router.put("/changepassword/:id", protect, changeMyPasswordController);
router.patch("/bulk", protect, bulkUpdateUsersController);
router.post("/:id/extend", protect, extendSubscriptionController);

// Other actions (you may also want protect here, depending on business rules)
router.delete("/:id", deleteUserController);
router.put("/:id/delink-device", delinkUserDeviceController);
router.put("/:id/block", blockUserController);
router.put("/:id/unblock", unblockUserController);

export default router;
