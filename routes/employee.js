const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee.controller");
const authEmployee = require("../middleware/auth.employee");
router.post("/money-recharge",authEmployee, employeeController.rechargeMoney);
router.post("/login", employeeController.loginEmployee); //Api đăng nhập của employee
router.post("/updateInfoPersonal",authEmployee, employeeController.updateInfoProfile); //Update thông tin employee
router.get("/info/profile", authEmployee, employeeController.getEmployeeInfo); //Lấy thông tin employee
router.get("/account-customers", authEmployee, employeeController.getAllAccountCustomers);
router.get("/historyDealOfCustomer/:username", employeeController.getHistoryDealOfCustomer); //lấy lịch sử giao dịch của 1 customer
router.post("/refreshToken", employeeController.refreshToken); //Lấy lại token
//router.get("/info-customer",employeeController.getInfoCustomer);
module.exports = router;
