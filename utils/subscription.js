// utils/subscription.js

// Days left from now until expiresAt (can be negative if already past)
export const getDaysLeft = (expiresAt) => {
  if (!expiresAt) return null;

  const now = new Date();
  const diff = new Date(expiresAt) - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Compute a status snapshot for UI, WITHOUT changing DB
export const getUserSubscriptionStatus = (user) => {
  const now = new Date();
  const sub = user.subscription || {};

  const daysLeft = getDaysLeft(sub.expiresAt);

  // We do NOT auto-change status in DB, but for UI:
  const isExpiredByDate = sub.expiresAt && new Date(sub.expiresAt) < now;

  const effectiveStatus = isExpiredByDate ? "EXPIRED" : (sub.status || "TRIAL");

  return {
    status: effectiveStatus,
    // canPurchase is just a helper flag – you can tune this as needed
    canPurchase: effectiveStatus === "TRIAL" || effectiveStatus === "EXPIRED",
    daysLeft: daysLeft,
    isExpiringSoon: daysLeft !== null && daysLeft > 0 && daysLeft <= 4,
  };
};

// Short summary of subscription history for UI
export const getSubscriptionHistorySummary = (user) => {
  const logs = user.subscriptionLog || [];
  const latest = logs[0];

  return {
    totalChanges: logs.length,
    latestAction: latest?.action || null,
    latestAdmin: latest?.adminName || null,
    lastUpdated: latest?.timestamp || null,
    history: logs.slice(0, 5).map((log) => ({
      action: log.action,
      plan: log.newPlan?.subscription_plan,
      status: log.newPlan?.status,
      date: log.timestamp,
      admin: log.adminName,
      notes: log.notes,
    })),
  };
};

// Decide what kind of change this is for logging (CREATED / EXTENDED / UPGRADED / RENEWED)
export const getSubscriptionActionType = (oldSub, newPlan) => {
  const oldPlan = oldSub?.subscription_plan || "TRIAL";
  const oldStatus = oldSub?.status || "TRIAL";

  // First time assigning a paid plan after trial
  if (!oldSub || !oldSub.subscription_plan || oldPlan === "TRIAL") {
    return "CREATED";
  }

  // If old plan was expired and we give new period on same plan
  if (oldStatus === "EXPIRED") {
    return "RENEWED";
  }

  // If plan type changed (BASIC → PRO, PRO → PREMIUM, etc.)
  if (oldPlan !== newPlan) {
    return "UPGRADED";
  }

  // Same plan, new dates
  return "EXTENDED";
};
