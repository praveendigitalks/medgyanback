import express from "express";

const router =express.Router();
import dotenv from "dotenv";
dotenv.config();
// ------------------ Authentication Routes Import ------------------------------------
// import permissionRouter from "./permission.routes.js";
// import roleRouter from "./role.routes.js";
import userRouter from "./user.route.js";
import { LoginUser, LogoutUser, forgotPinController, verifyResetPinController } from "../controller/auth.controller.js";
import contentRouter from "./content.routes.js";
import categoryRouter from "./category.routes.js";
// import authUser from "./auth.routes.js";





// ------------------ Authentication Routes Used ------------------------------------
// router.use("/permission", permissionRouter);
// router.use("/role",roleRouter );
router.use("/user", userRouter);
router.use("/login", LoginUser);
router.use("/logout", LogoutUser);
router.use("/forgotpin", forgotPinController);
router.use("/verifypin", verifyResetPinController);


// ------------------ Modules & Seections Routes Used ---------------------------------
router.use("/category", categoryRouter)
router.use("/content", contentRouter);
// router.use("/about", aboutRouter);
// router.use("/resume", resumeRouter);
// router.use("/portfolio", portfolioRouter);
// router.use("/contact", conatctRouter);


export default router;