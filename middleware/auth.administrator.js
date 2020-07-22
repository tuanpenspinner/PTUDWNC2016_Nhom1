const jwt = require("jsonwebtoken");

authAdministrator = (req, res, next) => {
  const token = req.headers["access-token"];
  if (token) {
    jwt.verify(token, "secretKeyAdministrator", (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError")
          res.status(401).json({ message: "Token hết hạn!" });
        else res.status(401).json({ message: "Token không chính xác!" });
      } else {
        req.payload = payload;
        next();
      }
    });
  } else {
    res.status(401).json({ message: "Token không chính xác!" });
  }
};

module.exports = authAdministrator;
