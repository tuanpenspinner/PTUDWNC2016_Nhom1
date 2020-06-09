const jwt = require("jsonwebtoken");

authEmployee = (req, res, next) => {
  const token = req.headers["access-token"];
  if (token) {
    jwt.verify(token, "secretKeyEmployee", (err, payload) => {
      if (err)  res.status(401).send("Không được phép truy cập")
      req.payload = payload;
      next();
    });
  } else {
    res.status(401).send("Không được phép truy cập")
  }
};

module.exports = authEmployee;