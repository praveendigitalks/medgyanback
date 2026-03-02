import express from "express";
import { createCategoryController, getCategoryController } from "../controller/category.controller.js";

const router = express.Router();

router.post("/", createCategoryController);
router.get("/", getCategoryController);

export default router;