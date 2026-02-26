import express from "express";

const router =express.Router();
// ------------------ Authentication Routes Import ------------------------------------
// import permissionRouter from "./permission.routes.js";
// import roleRouter from "./role.routes.js";
import userRouter from "./user.route.js";
import { LoginUser, LogoutUser } from "../controller/auth.controller.js";
// import authUser from "./auth.routes.js";



// ------------------ Modules & Seections Routes Import ---------------------------------
// import aboutRouter from "./about.routes.js";
// import resumeRouter from "./resume.routes.js";
// import portfolioRouter from "./portfolio.routes.js";
// import conatctRouter from "./contact.routes.js";

// ------------------ Authentication Routes Used ------------------------------------
// router.use("/permission", permissionRouter);
// router.use("/role",roleRouter );
router.use("/user", userRouter);
router.use("/login", LoginUser);
router.use("/logout", LogoutUser);
// router.use("/tenant", tenantRouter);
// router.use("/login", authUser);

// ------------------ Modules & Seections Routes Used ---------------------------------
// router.use("/about", aboutRouter);
// router.use("/resume", resumeRouter);
// router.use("/portfolio", portfolioRouter);
// router.use("/contact", conatctRouter);


export default router;