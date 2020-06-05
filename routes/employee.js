const express = require('express');
const router = express.Router();
const employeeController= require("../controllers/employee.controller");

router.get("/list-employee", employeeController.getAllEmployees);
router.get("/get-employee", employeeController.getEmployee);
router.post("/create-employee", employeeController.createEmployee);
router.post("/delete-employee/", employeeController.deleteEmployee);
router.post("/update-employee/", employeeController.updateEmployee);
module.exports = router;