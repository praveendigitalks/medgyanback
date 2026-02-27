export const getDaysLeft = (expiresAt) => {
  if (!expiresAt) return null;

  const now = new Date();
  const diff = new Date(expiresAt) - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getUserSubscriptionStatus = (user) => {
  const now = new Date();
  const sub = user.subscription || {};

  // expired by date
  if (sub.expiresAt && new Date(sub.expiresAt) < now) {
    return {
      status: "EXPIRED",
      canPurchase: true,
      daysLeft: 0,
      isExpiringSoon: false
    };
  }

  const daysLeft = getDaysLeft(sub.expiresAt);

  return {
    status: sub.status || "TRIAL",
    canPurchase: sub.status === "TRIAL" || sub.status === "EXPIRED",
    daysLeft,
    isExpiringSoon: daysLeft !== null && daysLeft <= 4
  };
};