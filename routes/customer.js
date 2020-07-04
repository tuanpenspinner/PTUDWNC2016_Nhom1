const express = require("express");
const router = express.Router();
const authCustomer = require("../middleware/auth.customer");
// const authEmployee =require('../middleware/auth.employee')
const customerController = require("../controllers/customer.controller");
router.get("/list-customer", customerController.getAllCustomers);
router.get("/:accountNumber", authCustomer, customerController.getCustomer);
router.get("/info/profile", authCustomer, customerController.getCustomerInfo); //Lấy thông tin customer
router.post("/register", customerController.registerCustomer); //Api đăng kí tài khoản customer
router.post("/updateNameCustomer", customerController.updateNameCustomer); //Api đổi tên customer

router.post("/login", customerController.loginCustomer); //Api đăng nhập của customer
router.post(
  "/changePassword",
  authCustomer,
  customerController.changePasswordCustomer
); //Api thay đổi mật khẩu
router.post("/otpGenerate", customerController.otpGenerate); //Api tạo mã OTP
router.post("/saveAndSendOTP", customerController.saveAndSendOTP); //Lưu mã OTP vào database
router.post(
  "/otpValidateAndResetPassword",
  customerController.otpValidateAndResetPassword
); //Api xác nhận mã OTP và reset password
router.post("/refreshToken", customerController.refreshToken); //Lấy lại token
module.exports = router;
