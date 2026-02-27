import User from "../models/user.model.js";

export const checkSubscriptionExpiry = async () => {
  try {
    const now = new Date();

    // 4 days from now
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 4);

    const users = await User.find({
      "subscription.expiresAt": {
        $lte: reminderDate,
        $gte: now
      },
      "subscription.expiryNotified": false
    });

    for (const user of users) {
      console.log(`⚠️ Subscription expiring soon for ${user.email}`);

      // 👉 TODO: send email / whatsapp / push here

      user.subscription.expiryNotified = true;
      await user.save();
    }

    // ✅ mark expired users
    await User.updateMany(
      {
        "subscription.expiresAt": { $lt: now },
        "subscription.status": { $ne: "EXPIRED" }
      },
      {
        $set: { "subscription.status": "EXPIRED" }
      }
    );

  } catch (err) {
    console.error("Expiry check error:", err);
  }
};