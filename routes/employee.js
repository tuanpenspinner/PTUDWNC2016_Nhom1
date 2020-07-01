const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee.controller");
const authEmployee = require("../middleware/auth.employee");
router.post("/money-recharge", employeeController.rechargeMoney);
router.post("/login", employeeController.loginEmployee); //Api đăng nhập của employee
router.get("/info/profile", authEmployee, employeeController.getEmployeeInfo); //Lấy thông tin employee
router.get("/account-customers",authEmployee,employeeController.getAllAccountCustomers);
//router.get("/info-customer",employeeController.getInfoCustomer);
module.exports = router;
