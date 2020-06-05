const express = require('express');
const router = express.Router();
const customerController= require("../controllers/customer.controller");
router.get("/list-customer", customerController.getAllCustomers);
router.get("/:accountNumber", customerController.getCustomer);
router.get("/register", customerController.registerCustomer);
router.get("/login", customerController.loginCustomer);
module.exports = router;