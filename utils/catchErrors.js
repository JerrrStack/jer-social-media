const catchErrors = (error) => {
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    if (data.message) return data.message;
    return "Request failed";
  }

  if (error.request) {
    return "No response from server. Check your connection.";
  }

  return error.message || "Something went wrong";
};

export default catchErrors;
