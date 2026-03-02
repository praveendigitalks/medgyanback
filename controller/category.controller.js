import { createCategoryService, getCategoryService } from "../service/category.service.js";

export const createCategoryController = async (req, res) => {
  const data = await createCategoryService(req.body);
  res.json(data);
};

export const getCategoryController = async (req, res) => {
  const data = await getCategoryService();
  res.json(data);
};