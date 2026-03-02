import Content from "../models/content.model.js";
import {
  createContentService,
  getAllContentService,
  getContentByIdService,
} from "../service/content.service.js";

export const createContentController = async (req, res) => {
  try {

    const data = { ...req.body };

    /* ================= allowedPlans parse ================= */

    if (data.allowedPlans) {
      try {
        data.allowedPlans = JSON.parse(data.allowedPlans);
      } catch (e) {
        data.allowedPlans = [];
      }
    }

    /* ================= thumbnail handle ================= */

    if (req.file) {
      // multer diskStorage already unique filename generate karega
      data.thumbnail = req.file.filename;
    }

    /* ================= boolean fix (FormData issue) ================= */

    if (data.isFree !== undefined) {
      data.isFree = data.isFree === "true";
    }

    if (data.isPublished !== undefined) {
      data.isPublished = data.isPublished === "true";
    }

    /* ================= create ================= */

    const content = await createContentService(data);

    return res.status(201).json({
      success: true,
      message: "Content created successfully",
      content
    });

  } catch (err) {

    console.log("Create Content Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const getAllContentController = async (req, res) => {
  try {
     const contents = await getAllContentService(req.query);
  const total = await Content.countDocuments({});

    return res.status(200).json({
      success: true,
      message: "Contents retrieved successfully",
      contents,
      pagination: {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        total,
        pages: Math.ceil(total / (parseInt(req.query.limit) || 10)),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

};

export const getContentByIdController = async (req, res) => {
  const data = await getContentByIdService(req.params.id);
  res.json(data);
};
