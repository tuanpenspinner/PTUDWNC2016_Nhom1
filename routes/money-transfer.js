const express = require('express');
const router = express.Router();
const controller = require('../controllers/money-transfer.controller');

router.get('/', controller.moneyTransfer);
router.post('/', controller.postMoneyTransfer);
router.get('/bank-detail', controller.bankDetail);

module.exports = router;
