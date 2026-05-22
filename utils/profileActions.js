import axios from "axios";
import baseUrl from "./baseUrl";
import catchErrors from "./catchErrors";
import cookie from "js-cookie";
import Router from "next/router";

const Axios = axios.create({
  baseURL: `${baseUrl}/api/profile`,
  headers: { Authorization: cookie.get("token") },
});

export const followUser = async (userToFollowId, setCurrentUser) => {
  try {
    await Axios.post(`/follow/${userToFollowId}`);

    setCurrentUser((prev) => ({
      ...prev,
      following: [...prev.following, { user: userToFollowId }],
    }));
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const unfollowUser = async (userToUnfollowId, setCurrentUser) => {
  try {
    await Axios.put(`/unfollow/${userToUnfollowId}`);

    setCurrentUser((prev) => ({
      ...prev,
      following: prev.following.filter(
        (following) => following.user !== userToUnfollowId
      ),
    }));
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const updateProfile = async (text, profilePicUrl, setError) => {
  const { bio, website } = text;
  try {
    await Axios.post(`/update`, { bio, profilePicUrl, website });
    Router.reload();
  } catch (error) {
    alert(catchErrors(error));
    setError(catchErrors(error));
  }
};
