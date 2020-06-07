const fs = require('fs');
const jwt = require('jsonwebtoken');
const nodeRSA = require('node-rsa');
const hash = require('object-hash');
const axios = require('axios');
const superagent = require('superagent');
const moment = require('moment');
const openpgp = require('openpgp');

const customerModel = require('../models/customer.model');

const PARTNERS = {
  PPNBank: {
    bank_code: 'PPNBank', // team Phong Le
    secret: 'phongledeptrai',
    apiRoot: 'https://whispering-oasis-78594.herokuapp.com/api',
  },
  CryptoBank: {
    bank_code: 'CryptoBank', // team Dang Thanh Tuan
    secret: 'CryptoBank_secret',
    apiRoot: 'https://crypto-bank-1612785.herokuapp.com/api',
  },
};
const MY_BANK_SECRET = 'hiphopneverdie';
const MY_BANK_CODE = 'TUB';

// RSA key-pair
const rsaPrivateKeyString = fs.readFileSync('rsa_private.key', 'utf8');
const rsaPublicKeyString = fs.readFileSync('rsa_public.key', 'utf8');
// PGP key pair
const pgpPublicKeyString = fs.readFileSync('pgp_public.key', 'utf8');
const pgpPrivateKeyString = fs.readFileSync('pgp_private.key', 'utf8');
// partners
const parterRsaPublicKeyString = fs.readFileSync('partner_rsa_public.key', 'utf8');
const partnerPgpPublicKeyString = fs.readFileSync('partner_pgp_public.key', 'utf8');

const rsaPrivateKey = new nodeRSA().importKey(rsaPrivateKeyString);
const partnerRSAPublicKey = new nodeRSA().importKey(parterRsaPublicKeyString);

// implement
function checkSecurity(req, isMoneyAPI = false) {
  const { bank_code, sig, ts } = req.headers;
  // check partner code
  if (!PARTNERS[bank_code]) throw new Error('Your bank_code is not correct.');
  // check time in 1 minute
  if (Date.now() - parseInt(ts) > 1000 * 60) throw new Error('Time exceed.');
  // check signature. If money API then ignore check here
  if (isMoneyAPI) return;
  const sigString = bank_code + ts.toString() + JSON.stringify(req.body) + MY_BANK_SECRET;
  const hashString = hash.MD5(sigString);
  console.log('hashStr', ts, hashString);
  if (sig !== hashString) throw new Error('Signature failed.');
}

function verifySig(req) {
  try {
    checkSecurity(req, true);
    const { bank_code, sig, ts } = req.headers;

    // verify
    switch (bank_code) {
      case 'PPNBank':
        {
          const sigString = bank_code + ts.toString() + JSON.stringify(req.body) + MY_BANK_SECRET;
          const hashString = hash.MD5(sigString); // return hex encoding string
          // sign
          // const genSig = priKeyRSA.sign(hashString, 'hex', 'hex');
          // console.log('genSig', genSig);
          const verification_result = partnerRSAPublicKey.verify(hashString, sig, 'hex', 'hex');
          if (!verification_result) {
            throw new Error('Verify your RSA signature failed.');
          }
        }
        break;
      default:
    }
  } catch (err) {
    throw new Error(err.message);
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
      const account = await customerModel.getCustomerByAccount(account_number);
      if (!account) throw new Error('Account not found.');
      res.json({
        name: account.name,
        account_number: account.checkingAccount.accountNumber,
      });
    } catch (err) {
      res.status(401).json({ message: `${err.message}` });
    }
  },
  partnerBankDetail: (req, res) => {
    // api noi bo - get thong tin tai khoan ngan hang partners
    // body = { bank_code, account_number }
    const { bank_code, account_number } = req.headers;
    console.log('hihihihihiihi', req.body, req.headers);
    switch (bank_code) {
      case 'CryptoBank':
        {
          const requestTime = moment().format();
          const body = {};
          const sigString = MY_BANK_CODE + requestTime + JSON.stringify(body) + PARTNERS[bank_code].secret;
          const hashString = hash(sigString, { algorithm: 'sha256', encoding: 'hex' });
          console.log('hashssss', hashString, requestTime);

          const headers = {
            'Content-Type': 'application/json',
            'x-partner-code': MY_BANK_CODE,
            'x-partner-request-time': requestTime,
            'x-partner-hash': hashString,
          };
          axios
            .get(`${PARTNERS[bank_code].apiRoot}/services/account_number/${account_number}`, {
              headers: headers,
            })
            .then((result) => {
              console.log('resss', result);
              res.json(result.data);
            })
            .catch((err) => console.log('ERR', err.message));
        }
        break;
      case 'PPNBank':
        {
          const body = {
            account_number: account_number,
          };
          const ts = moment().valueOf();
          const partnerCode = 'TUB';
          const secret = PARTNERS.PPNBank.secret;
          const sig = hash.MD5(ts + JSON.stringify(body) + secret);

          console.log(body, ts, partnerCode, secret, sig);
          const headers = {
            ts,
            partnerCode,
            sig,
            'Content-Type': 'application/json',
          };

          superagent
            .post(`${PARTNERS[bank_code].apiRoot}/accounts/partner`)
            .send(body)
            .set(headers)
            .end((err, result) => {
              const name = JSON.parse(result.res.text).name;
              res.status(200).json({ account_number, name });
            });
        }
        break;
      default:
        console.log('ERR bank_code wrong');
    }

    // res.json({});
  },
  moneyTransfer: async (req, res) => {
    // api noi bo
    // lay bank_code sau do goi api cua partner de thuc hien y/c chuyen tien
    const { bank_code, amount, request_from, request_to } = req.body;
    switch (bank_code) {
      case 'CryptoBank':
        {
          const signRequest = async (data) => {
            // const privateKeyArmored = JSON.parse(`"${config.PRIVATE_KEY}"`); // convert '\n'
            const privateKeyArmored = pgpPrivateKeyString;
            const passphrase = 'Hiphop_never_die'; // PGP passphrase

            const {
              keys: [privateKey],
            } = await openpgp.key.readArmored(privateKeyArmored);
            await privateKey.decrypt(passphrase);

            const { signature: detachedSignature } = await openpgp.sign({
              message: openpgp.cleartext.fromText(data), // CleartextMessage or Message object
              privateKeys: [privateKey], // for signing
              detached: true,
            });
            return JSON.stringify(detachedSignature);
          };

          const body = {
            partner_code: MY_BANK_CODE,
            amount: amount,
            depositor: request_from,
            receiver: request_to,
          };
          const requestTime = moment().format();
          const sigString = MY_BANK_CODE + requestTime + JSON.stringify(body) + PARTNERS[bank_code].secret;
          const hashString = hash(sigString, { algorithm: 'sha256', encoding: 'hex' });
          const signature = await signRequest(hashString);
          console.log('signature', signature);

          const headers = {
            'Content-Type': 'application/json',
            'x-partner-code': MY_BANK_CODE,
            'x-partner-request-time': requestTime,
            'x-partner-hash': hashString,
          };
          axios
            .post(
              `${PARTNERS[bank_code].apiRoot}/services/deposits/account_number/${request_to.account_number}`,
              body,
              {
                headers: headers,
              },
            )
            .then((res) => {
              console.log('resss', res);
              res.json(res.data);
            })
            .catch((err) => console.log('ERR', err.message));
        }
        break;
      case 'PPNBank':
        {
          const { bank_code, amount, request_from, request_to } = req.body;
          // sign
          const ts = moment().valueOf();
          const body = {
            account_number: request_to,
            amount: 50000,
          };
          const hashString = hash.MD5(ts + JSON.stringify(body) + PARTNERS.PPNBank.secret);
          const sig = rsaPrivateKey.sign(hashString, 'hex', 'hex');
          const headers = {
            ts,
            bank_code: MY_BANK_CODE,
            sig,
          };

          superagent
            .get(`${PARTNERS[bank_code].apiRoot}/accounts/partner/transfer`)
            .send(body)
            .set(headers)
            .end((err, result) => {
              res.status(200).json(JSON.parse(result.text));
            });
        }
        break;
      default:
        console.log('ERR bank_code wrong');
    }
  },
  postMoneyTransfer: async (req, res) => {
    try {
      verifySig(req);
      const { amount, request_to } = req.body;
      if (isNaN(amount)) throw new Error('There is error in your request body.');
      const account = await customerModel.getCustomerByAccount(request_to);
      if (!account) throw new Error('Account not found.');

      const balance = parseInt(account.checkingAccount.amount);
      if (amount > 0) {
        // cong tien
        const newAmount = balance + amount;
        await customerModel.updateCheckingAmount(request_to, newAmount);
      } else {
        throw new Error('There is error in your request body.');
      }
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
    res.status(200).json({ message: 'Transfer money done' });
  },
};
