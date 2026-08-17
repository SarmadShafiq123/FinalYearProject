export const canAccessDashboard = (user) => {
  if (!user) return false;

  const status = user.planStatus;

  if (status === "inactive") return false;
  if (
    status === "active" ||
    status === "free" ||
    status === "locked" ||
    status === "expired"
  ) {
    return true;
  }

  return false;
};

export const getPostLoginRedirect = (user) => {
  if (!user) return "/login";
  return canAccessDashboard(user) ? "/dashboard" : "/pricing";
};
