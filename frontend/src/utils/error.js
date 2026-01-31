export const getErrorMessage = (err, fallback = "Something went wrong") => {
  if (!err) return fallback;

  if (typeof err === "string") return err;

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
