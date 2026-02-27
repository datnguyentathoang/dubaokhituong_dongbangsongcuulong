module.exports = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện chức năng này",
      });
    }
    next();
  };
};
