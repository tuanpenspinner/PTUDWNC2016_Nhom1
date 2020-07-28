const express = require('express');
const router = express.Router();
const administratorController = require("../controllers/administrator.controller");
const authAdmin = require("../middleware/auth.administrator");

router.get("/list-employee",authAdmin, administratorController.getAllEmployees);
router.get("/get-employee",authAdmin, administratorController.getEmployee);
router.post("/register-employee",authAdmin, administratorController.registerEmployee);
router.post("/delete-employee",authAdmin, administratorController.deleteEmployee);
router.post("/update-employee",authAdmin, administratorController.updateEmployee);
router.get("/transaction-history", administratorController.getTransactionHistory);//lấy lịch sử giao dịch với đối tác
router.post("/register", administratorController.registerAdmin);
router.post("/login", administratorController.loginAdmin);
router.post("/refresh-token",authAdmin, administratorController.refreshToken);
module.exports = router;