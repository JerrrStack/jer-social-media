import axios from "axios";
import baseUrl from "./baseUrl";
import catchErrors from "./catchErrors";
import Router from "next/router";
import cookie from "js-cookie";
import {
  showLoadingToast,
  showSuccessToast,
  showErrorToast,
} from "./toast";

export const registerAccount = async (registerUser, setError, setLoading) => {
  setLoading(true);
  const toastId = showLoadingToast("Creating your account...");
  try {
    const res = await axios.post(`${baseUrl}/api/signup`, {
      registerUser,
    });

    showSuccessToast("Account created! Redirecting...", toastId);
    setToken(res.data);
  } catch (error) {
    const errorMsg = catchErrors(error);
    showErrorToast(errorMsg, toastId);
    setError(errorMsg);
    setLoading(false);
  }
};

export const loginUser = async (user, setError, setLoading) => {
  setLoading(true);
  const toastId = showLoadingToast("Logging in...");
  try {
    const res = await axios.post(`${baseUrl}/api/auth`, { user });

    showSuccessToast("Welcome back! Redirecting...", toastId);
    setToken(res.data);
  } catch (error) {
    const errorMsg = catchErrors(error);
    showErrorToast(errorMsg, toastId);
    setError(errorMsg);
    setLoading(false);
  }
};

export const redirectUser = (ctx, location) => {
  if (ctx.req) {
    ctx.res.writeHead(302, { Location: location });
    ctx.res.end();
  } else {
    Router.push(location);
  }
};

const setToken = (token) => {
  cookie.set("token", token);
  Router.push("/");
};

export const logoutUser = (email) => {
  cookie.set("userEmail", email);
  cookie.remove("token");
  Router.push("/login");
  Router.reload();
};
