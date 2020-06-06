const express = require('express');
const router = express.Router();
const employeeController= require("../controllers/employee.controller");

router.post("/money-recharge", employeeController.rechargeMoney);
module.exports = router;