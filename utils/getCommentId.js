/** Stable id for comment subdocuments (client + API). */
export function getCommentId(comment) {
  if (!comment) return "";
  if (comment._id != null) return String(comment._id);
  if (comment.id != null) return String(comment.id);
  return "";
}
