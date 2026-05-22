import axios from "axios";
import baseUrl from "./baseUrl";
import catchErrors from "./catchErrors";
import cookie from "js-cookie";

const Axios = axios.create({
  baseURL: `${baseUrl}/api/posts`,
  headers: { Authorization: cookie.get("token") },
});

export const submitNewPost = async (
  text,
  taggedUser,
  picUrl,
  setPosts,
  setCreatePost,
  setError
) => {
  try {
    const res = await Axios.post("/", { text, taggedUser, picUrl });

    setPosts((prev) => [res.data, ...prev]);
    if (typeof setCreatePost === "function") setCreatePost();
    setError(null);
  } catch (error) {
    const errorMsg = catchErrors(error);
    setError(errorMsg);
  }
};

export const deletePost = async (postId, setPosts) => {
  try {
    await Axios.delete(`/${postId}`);
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  } catch (error) {
    const errorMsg = catchErrors(error);
    alert(catchErrors(error));
  }
};

export const postComment = async (
  postId,
  user,
  text,
  setComments,
  setText,
  parentCommentId = null
) => {
  try {
    const body = { text };
    if (parentCommentId) {
      body.parentCommentId = String(parentCommentId);
    }

    const res = await Axios.post(`/comment/${postId}`, body);
    const data = res.data;
    const postedComment = {
      ...data,
      _id: data._id,
      user: data.user || user,
      text: data.text || text,
      date: data.date || Date.now(),
      parentCommentId: data.parentCommentId
        ? String(data.parentCommentId)
        : null,
      likes: data.likes || [],
    };
    setComments((prev) => [postedComment, ...prev]);
    setText("");
    return postedComment;
  } catch (error) {
    const errorMsg = catchErrors(error);
    alert(errorMsg);
  }
};

export const likePost = async (postId, userId, setLikes, like = true) => {
  try {
    if (like) {
      await Axios.post(`/like/${postId}`);
      setLikes((prev) => [...prev, { user: userId }]);
    } else if (!like) {
      await Axios.put(`/unlike/${postId}`);
      setLikes((prev) => prev.filter((like) => like.user !== userId));
    }
  } catch (error) {
    alert(catchErrors(error));
  }
};

const updateCommentLikes = (commentId, userId, add, setComments) => {
  setComments((prev) =>
    prev.map((comment) => {
      if (comment._id !== commentId) return comment;
      const likes = comment.likes || [];
      if (add) {
        if (likes.some((l) => String(l.user) === String(userId))) return comment;
        return { ...comment, likes: [...likes, { user: userId }] };
      }
      return {
        ...comment,
        likes: likes.filter((l) => String(l.user) !== String(userId)),
      };
    })
  );
};

export const likeComment = async (postId, commentId, userId, setComments) => {
  try {
    await Axios.post(`/comment/like/${postId}/${commentId}`);
    updateCommentLikes(commentId, userId, true, setComments);
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const unlikeComment = async (postId, commentId, userId, setComments) => {
  try {
    await Axios.put(`/comment/unlike/${postId}/${commentId}`);
    updateCommentLikes(commentId, userId, false, setComments);
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const deleteComment = async (postId, commentId, setComments) => {
  try {
    await Axios.delete(`/${postId}/${commentId}`);
    setComments((prev) =>
      prev.filter(
        (comment) =>
          comment._id !== commentId && comment.parentCommentId !== commentId
      )
    );
  } catch (error) {
    alert(catchErrors(error));
  }
};
