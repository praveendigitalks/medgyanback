
import {
  createUser,
  getUser,
  getUserbyId,
  updateUser,
  deleteUser,
  
} from "../service/user.service.js";

export const CreateUserController = async (req, res) => {
  try {
    const users = await createUser(req.body);
    return res.status(201).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const GetUserController = async (req, res) => {
  try {
    // console.log("🚀 ~ GetUserController ~ tenantId:", tenantId)
    const users = await getUser();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const GetUserControllerByid = async (req, res) => {
  try {
    const users = await getUserbyId(req.params.id);
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const updateUserController = async (req, res) => {
  try {
    const users = await updateUser(req.params.id, req.body);
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const deleteUserController = async (req, res) => {
  try {
    const users = await deleteUser(req.params.id);
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


