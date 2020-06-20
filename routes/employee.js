const express = require('express');
const router = express.Router();
const employeeController= require("../controllers/employee.controller");

router.post("/money-recharge", employeeController.rechargeMoney);
router.post("/login", employeeController.loginEmployee); //Api đăng nhập của employee
module.exports = router;