
import User from "../models/user.model.js";
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
    const users = await getUser(req.query);
    const total = await User.countDocuments({}); // or countDocuments(filter) if you want filtered count

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users,
      pagination: {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        total,
        pages: Math.ceil(
          total / (parseInt(req.query.limit) || 10)
        ),
      },
    });
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


