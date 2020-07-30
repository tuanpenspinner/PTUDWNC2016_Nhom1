const customerModel = require("../models/customer.model");

module.exports = async (req, res, next) => {
  const { transferer, otp } = req.body;

  if (otp) {
    const isValid = await customerModel.checkMailOTP(transferer, otp);
    if (isValid) {
      next();
    } else res.status(401).json({ message: "Mã OTP không chính xác" });
  } else {
    const OTP = Math.floor(Math.random() * 9999 + 1);
    const customer = await customerModel.updateMailOTP(transferer, OTP);
    await customerModel.sendOTP(customer.email, OTP);
    if (customer) res.status(201).json({ message: "new otp has created" });
    else res.status(404).end();
  }
};
