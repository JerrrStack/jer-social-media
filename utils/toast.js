import { toast } from "react-toastify";

/** react-toastify v7 has no toast.loading — use info + update instead */

export const showLoadingToast = (message) =>
  toast.info(message, {
    autoClose: false,
    closeOnClick: false,
    draggable: false,
  });

export const showSuccessToast = (message, toastId) => {
  if (toastId) {
    toast.update(toastId, {
      render: message,
      type: toast.TYPE.SUCCESS,
      autoClose: 2000,
      closeOnClick: true,
    });
  } else {
    toast.success(message);
  }
};

export const showErrorToast = (message, toastId) => {
  if (toastId) {
    toast.update(toastId, {
      render: message,
      type: toast.TYPE.ERROR,
      autoClose: 4000,
      closeOnClick: true,
    });
  } else {
    toast.error(message);
  }
};
