const express = require('express');
const router = express.Router();
const moneyTransferController = require('../controllers/money-transfer.controller');
const customerController = require('../controllers/customer.controller');
const debtReminderController = require('../controllers/debt-reminder.controller');
const authCustomer = require("../middleware/auth.customer");
router.get('/', (req, res) => {
  res.send(
    "Welcome to TEAM 1's great internet banking (bank code: TUB). See document here: https://docs.google.com/document/d/17w6jJBUfaYHJgnTOcW7zuYdk7lIeM_6B5KhcqS7dDiQ/edit?usp=sharing",
  );
});

// public apis
router.post('/money-transfer', moneyTransferController.postMoneyTransfer);
router.get('/bank-detail', moneyTransferController.bankDetail);

// internal apis
router.get('/money-transfer', moneyTransferController.moneyTransfer);
router.get('/partner-bank-detail', moneyTransferController.partnerBankDetail);
//router.get('/debt-reminders');
router.get('/debt-reminders/',authCustomer , debtReminderController.getListRemindersByAccount);
router.post('/debt-reminders', debtReminderController.createReminder);
router.put('/debt-reminders/complete/:id', debtReminderController.completeReminder);
router.put('/debt-reminders/cancel/:id', debtReminderController.cancelReminder);
router.post('debt-reminders/:id/payment');

module.exports = router;
