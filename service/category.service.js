import Category from "../models/category.model.js";


export const createCategoryService = async (data) => {
  return await Category.create(data);
};

export const getCategoryService = async () => {
  return await Category.find();
};