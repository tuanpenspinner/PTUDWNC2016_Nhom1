const fs = require('fs');
const jwt = require('jsonwebtoken');
const nodeRSA = require('node-rsa');
const hash = require('object-hash');
const axios = require('axios');

const customerModel = require('../models/customer.model');

const PARTNERS = {
  RSA_bank: {
    bank_code: 'RSA_bank',
    secret: 'hello',
  },
  CryptoBank: {
    bank_code: 'CryptoBank', // team Dang Thanh Tuan
    secret: 'CryptoBank_secret',
  },
};
const MY_BANK_SECRET = 'hiphopneverdie';
const MY_BANK_CODE = 'TUB';

// RSA key-pair
const rsaPrivateKeyString = fs.readFileSync('rsa_private.key', 'utf8');
const rsaPublicKeyString = fs.readFileSync('rsa_public.key', 'utf8');

// load key from PEM string
const pubKeyRSA = new nodeRSA();
const priKeyRSA = new nodeRSA();

pubKeyRSA.importKey(rsaPublicKeyString);
priKeyRSA.importKey(rsaPrivateKeyString);

// implement
function checkSecurity(req, isMoneyAPI = false) {
  const { bank_code, sig, ts } = req.headers;
  // check partner code
  if (!PARTNERS[bank_code]) throw new Error('Your bank_code is not correct.');
  // check time in 1 minute
  if (Date.now() - parseInt(ts) > 3600) throw new Error('Time exceed.');
  // check signature. If money API then ignore check here
  if (isMoneyAPI) return;
  const sigString = bank_code + ts.toString() + JSON.stringify(req.body) + MY_BANK_SECRET;
  const hashString = hash.MD5(sigString);
  console.log('hashStr', hashString);
  if (sig !== hashString) throw new Error('Signature failed.');
}

function verifySig(req) {
  checkSecurity(req, true);
  const { bank_code, sig, ts } = req.headers;

  const sigString = bank_code + ts.toString() + JSON.stringify(req.body) + MY_BANK_SECRET;
  const hashString = hash.MD5(sigString); // return hex encoding string

  // sign
  // const genSig = priKeyRSA.sign(hashString, 'hex', 'hex');
  // console.log('genSig', genSig);

  // verify
  const verification_result = pubKeyRSA.verify(hashString, sig, 'hex', 'hex');
  if (!verification_result) {
    throw new Error('Verify your RSA signature failed.');
  }
}

function moneyTransfer() {}

// body = {
//   type: 'deposit',
//   amount: 50000,
//   request_from: {
//     account_number: '43154325341',
//     full_name: 'Name A'
//   },
//   request_to: {
//     account_number: '56154325345',
//     full_name: 'Name B'
//   }
// }

function getBankDetail(partner_code) {
  const data = {};
  const ts = Date.now().toString();
  const sigString = MY_BANK_CODE + ts + JSON.stringify(data) + partners[partner_code].secret;
  const sig = hash.MD5(sigString);
  const headers = {
    bank_code,
    ts,
    sig,
  };

  const instance = axios.create({
    baseURL: 'http://localhost:3001/',
    timeout: 3000,
    headers,
  });
  instance.post('/', data).then((res) => {
    console.log(res);
  });
}

module.exports = {
  bankDetail: async (req, res) => {
    try {
      const { account_number } = req.body;
      if (!account_number) throw new Error('account_number is missing in request body.');

      checkSecurity(req);
      const account = await customerModel.getCustomer(account_number);
      if (!account) throw new Error('Account not found.');
      res.json({
        name: account.name,
        account_number: account.checkingAccount.accountNumber,
      });
    } catch (err) {
      res.json({ error: `${err.message}` });
    }
  },
  moneyTransfer: (req, res) => {
    // api noi bo
    // lay bank_code sau do goi api cua partner de thuc hien y/c chuyen tien
  },
  postMoneyTransfer: async (req, res) => {
    let msg;
    try {
      // verifySig(req);
      const { type, amount, request_to } = req.body;
      if (isNaN(amount)) throw new Error('There is error in your request body.');
      const account = await customerModel.getCustomer(request_to.account_number);
      if (!account) throw new Error('Account not found.');

      msg = 'SUCCESS verify';
      const balance = parseInt(account.checkingAccount.amount);
      if (type === 'deposit' && amount > 0) {
        // cong tien
        const newAmount = balance + amount;
        await customerModel.updateCheckingAmount(request_to.account_number, newAmount);
      } else if (type === 'withdraw' && amount > 0) {
        if (balance < amount) throw new Error("This account's balance is not enough to process.");
        // tru tien
        const newAmount = balance - amount;
        await customerModel.updateCheckingAmount(request_to.account_number, newAmount);
      } else {
        throw new Error('There is error in your request body.');
      }
    } catch (err) {
      msg = `ERROR: ${err.message}`;
    }
    res.json({ result: `${msg}` });
  },
};
