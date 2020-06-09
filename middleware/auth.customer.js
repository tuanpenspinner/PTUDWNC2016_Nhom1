const jwt = require("jsonwebtoken");

authCustomer = (req, res, next) => {
  const token = req.headers["access-token"];
  if (token) {
    jwt.verify(token, "secretKeyCustomer", (err, payload) => {
      if (err) res.status(401).send("Không được phép truy cập");
      req.payload = payload;
      next();
    });
  } else {
    res.status(401).send("Không được phép truy cập");
  }
};

module.exports = authCustomer;
