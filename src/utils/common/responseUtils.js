class responseUtils {
  static successResponse = (res, data, status = 200) => {
    return res.status(status).json({ success: true, data });
  };

  static errorResponse = (res, message, status = 400) => {
    return res.status(status).json({ success: false, error: message });
  };
}

export default responseUtils;