const jwt = require("jsonwebtoken");

authCustomer = (req, res, next) => {
  const token = req.headers["access-token"];
  if (token) {
    jwt.verify(token, "secretKeyCustomer", (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError")
          res.status(401).json({ isExpired: true, message: "Token hết hạn" });
        else res.status(401).json({ tokenError: true, message: "Lỗi token" });
      } else {
        req.payload = payload;
        next();
      }
    });
  } else {
    res.status(401).json({ tokenError: true, message: "Lỗi token" });
  }
};

module.exports = authCustomer;
