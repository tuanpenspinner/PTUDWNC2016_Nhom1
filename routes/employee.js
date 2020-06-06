const express = require('express');
const router = express.Router();
const employeeController= require("../controllers/employee.controller");

router.get("/list-employee", employeeController.getAllEmployees);
router.get("/get-employee", employeeController.getEmployee);
router.post("/register-employee", employeeController.registerEmployee);
router.post("/delete-employee", employeeController.deleteEmployee);
router.post("/update-employee", employeeController.updateEmployee);
router.post("/money-recharge", employeeController.rechargeMoney);
module.exports = router;