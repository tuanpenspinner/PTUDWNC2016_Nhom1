const express = require("express");
const router = express.Router();
const authCustomer = require("../middleware/auth.customer");
const authEmployee = require("../middleware/auth.employee");
const customerController = require("../controllers/customer.controller");
router.get("/list-customer", authEmployee, customerController.getAllCustomers);
router.get("info/:accountNumber", customerController.getCustomer); //Lấy thông tin customer theo checking account number
router.get(
  "/nameCustomer/:accountNumber",
  authCustomer,
  customerController.getNameCustomer
); //Lấy name customer theo checking account number
router.get("/info", authCustomer, customerController.getCustomerInfo); //Lấy thông tin customer
router.get(
  "/historyTransfer",
  authCustomer,
  customerController.getHistoryTransfer
); //Lấy lịch sử chuyển tiền
router.get(
  "/historyReceive",
  authCustomer,
  customerController.getHistoryReceive
); //Lấy lịch sử nhận tiền
router.get(
  "/historyPayDebt",
  authCustomer,
  customerController.getHistoryPayDebt
); //Lấy lịch sử thanh toán nợ
router.post("/register", authEmployee, customerController.registerCustomer); //Api đăng kí tài khoản customer
router.post(
  "/updateNameCustomer",
  authCustomer,
  customerController.updateNameCustomer
); //Api đổi tên customer
router.post(
  "/updateListReceivers",
  authCustomer,
  customerController.updateListReceivers
); //Api cập nhật danh sách người nhận
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
