import bcrypt from "bcryptjs";

export const hasPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hash) => {
  console.log("🚀 ~ comparePassword ~ password, hash:", password, hash)
  
  return await bcrypt.compare(password, hash);
};
