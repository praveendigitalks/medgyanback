import User from "../models/user.model.js";
import Content from "../models/content.model.js";

export const checkContentAccess = async (req, res, next) => {
  try {

    const user = await User.findById(req.user.id);
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    /* SUPER ADMIN FULL ACCESS */
    if (user.isSuperAdmin) {
      return next();
    }

    /* FREE CONTENT */
    if (content.isFree) {
      return next();
    }

    const plan = user.subscription?.subscription_plan;

    if (!plan) {
      return res.status(403).json({
        message: "Subscription required"
      });
    }

    /* PLAN CHECK */
    if (!content.allowedPlans.includes(plan)) {
      return res.status(403).json({
        message: "Upgrade plan to access this content"
      });
    }

    next();

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};