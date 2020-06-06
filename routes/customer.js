const express = require('express');
const router = express.Router();
// const authCustomer =require('../middleware/auth.customer')
// const authEmployee =require('../middleware/auth.employee')
const customerController= require("../controllers/customer.controller");
router.get("/list-customer", customerController.getAllCustomers);
router.get("/:accountNumber", customerController.getCustomer);
router.post("/register", customerController.registerCustomer);//Api đăng kí tài khoản customer
router.post("/login", customerController.loginCustomer);//Api đăng nhập của customer
router.post("/changePassword", customerController.changePasswordCustomer);//Api thay đổi mật khẩu
module.exports = router;