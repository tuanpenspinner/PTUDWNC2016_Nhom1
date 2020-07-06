const express = require('express');
const router = express.Router();
const administratorController= require("../controllers/administrator.controller");

router.get("/list-employee", administratorController.getAllEmployees);
router.get("/get-employee", administratorController.getEmployee);
router.post("/register-employee", administratorController.registerEmployee);
router.post("/delete-employee", administratorController.deleteEmployee);
router.post("/update-employee", administratorController.updateEmployee);
router.post("/register", administratorController.registerAdmin);
router.post("/login", administratorController.loginAdmin);
router.post("/refresh-token", administratorController.refreshToken);
module.exports = router;