const express = require("express");
const router = express.Router();
const authCustomer = require("../middleware/auth.customer");
// const authEmployee =require('../middleware/auth.employee')
const customerController = require("../controllers/customer.controller");
router.get("/list-customer", customerController.getAllCustomers);
router.get("/:accountNumber", authCustomer, customerController.getCustomer);
router.post("/register", customerController.registerCustomer); //Api đăng kí tài khoản customer
router.post("/login", customerController.loginCustomer); //Api đăng nhập của customer
router.post("/changePassword", customerController.changePasswordCustomer); //Api thay đổi mật khẩu
router.post("/ottGenerate", customerController.otpGenerate); //Api tạo mã OTP
router.post("/otpValidate", customerController.otpValidate); //Api xác nhận mã OTP
router.post("/sendOTP", customerController.sendOTP); //Gửi mã OTP tới địa chỉ nhận
module.exports = router;
