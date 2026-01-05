export const canEditTask = (user) => {
  if (!user) return false;
  return user.role === "admin" || user.role === "user";
};

export const canEditField = (user, field) => {
  if (!user) return false;

  if (user.role === "admin") return true;

  if (user.role === "user") {
    return field === "status";
  }

  return false;
};

export const isReadOnlyMode = ({ mode, source }) => {

  if (source === "activity_log") return true;

  if (mode === "view") return true;

  return false;
};
