/** Profile URLs use MongoDB _id; UI labels use display name. */

export const getProfilePath = (user) => {
  const id = user?._id;
  if (!id) return "/";
  return `/${String(id)}`;
};

export const getDisplayName = (user) => {
  if (!user) return "User";
  return user.name || user.username || "User";
};
