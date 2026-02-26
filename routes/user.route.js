import express from "express";
const router = express.Router();
import { CreateUserController, GetUserController,GetUserControllerByid, updateUserController,deleteUserController } from "../controller/user.controller.js";
import {protect} from "./../middleware/auth.middleware.js";

// router.use(protect)

router.post("/" ,CreateUserController);
router.get("/", GetUserController );
router.get("/:id",GetUserControllerByid);
router.put("/:id", updateUserController);
router.delete("/:id", deleteUserController)
export default router;