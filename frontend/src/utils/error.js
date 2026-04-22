export const getErrorMessage = (err, fallback = "Something went wrong") => {
  if (!err) return fallback;

  if (typeof err === "string") return err;

  const isNetworkError =
    err.code === "ERR_NETWORK" ||
    err.message === "Network Error" ||
    (!err.response && !!err.request);

  if (isNetworkError) {
    return "Cannot reach backend API. Start backend server and check VITE_API_URL.";
  }

  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || item?.message || item)
      .filter(Boolean)
      .join(", ");
  }

  if (detail && typeof detail === "object") {
    if (detail.msg) return detail.msg;
    try {
      return JSON.stringify(detail);
    } catch {
      return fallback;
    }
  }

  if (err.message) return err.message;

  return fallback;
};
