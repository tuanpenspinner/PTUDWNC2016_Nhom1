const express = require('express');
const router = express.Router();
const controller = require('../controllers/money-transfer.controller');

router.get('/', (req, res) => {
  res.send(
    "Welcome to TEAM 1's great internet banking (bank code: TUB). See document here: https://docs.google.com/document/d/17w6jJBUfaYHJgnTOcW7zuYdk7lIeM_6B5KhcqS7dDiQ/edit?usp=sharing",
  );
});
router.get('/money-transfer', controller.moneyTransfer);
router.post('/money-transfer', controller.postMoneyTransfer);
router.get('/bank-detail', controller.bankDetail);

module.exports = router;
