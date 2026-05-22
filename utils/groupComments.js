/** Flat comment list → normalized data and threaded tree (Facebook-style nesting) */

export function normalizeComments(comments = []) {
  if (!Array.isArray(comments)) return [];

  return comments.map((comment) => {
    const parentCommentId = comment?.parentCommentId;
    return {
      ...comment,
      parentCommentId:
        parentCommentId && String(parentCommentId).length > 0
          ? String(parentCommentId)
          : null,
      likes: Array.isArray(comment.likes) ? comment.likes : [],
    };
  });
}

const byDateAsc = (a, b) => new Date(a.date) - new Date(b.date);

/** @deprecated Use buildCommentTree for nested replies */
export function groupComments(comments = []) {
  const normalized = normalizeComments(comments);
  const topLevel = [];
  const repliesByParent = {};
  const ids = new Set(normalized.map((c) => String(c._id)));

  normalized.forEach((comment) => {
    const parentId = comment.parentCommentId;

    if (parentId && ids.has(parentId)) {
      if (!repliesByParent[parentId]) repliesByParent[parentId] = [];
      repliesByParent[parentId].push(comment);
    } else {
      topLevel.push(comment);
    }
  });

  topLevel.sort(byDateAsc);
  Object.keys(repliesByParent).forEach((key) => {
    repliesByParent[key].sort(byDateAsc);
  });

  return { topLevel, repliesByParent };
}

/** Build tree: each comment can have children (replies to any comment) */
export function buildCommentTree(comments = []) {
  const normalized = normalizeComments(comments);
  const nodes = {};
  const roots = [];

  normalized.forEach((comment) => {
    const id =
      comment._id != null ? String(comment._id) : String(comment.id || "");
    if (!id) return;
    nodes[id] = { ...comment, _id: id, children: [] };
  });

  normalized.forEach((comment) => {
    const id =
      comment._id != null ? String(comment._id) : String(comment.id || "");
    const node = nodes[id];
    if (!node) return;
    const parentId = comment.parentCommentId;

    if (parentId && nodes[parentId]) {
      nodes[parentId].children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortRecursive = (list) => {
    list.sort(byDateAsc);
    list.forEach((node) => sortRecursive(node.children));
  };

  sortRecursive(roots);
  return roots;
}

export function getCommentAuthorName(comment) {
  if (!comment?.user) return "User";
  return comment.user.name || comment.user.username || "User";
}
