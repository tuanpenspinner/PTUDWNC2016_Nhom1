const fs = require('fs');
const jwt = require('jsonwebtoken');
const nodeRSA = require('node-rsa');
const hash = require('object-hash');
const superagent = require('superagent');
const moment = require('moment');
const openpgp = require('openpgp');

const customerModel = require('../models/customer.model');
const dealModel = require('../models/deal.model');

const PARTNERS = {
  PPNBank: {
    bank_code: 'PPNBank', // team Phong Le
    secret: 'phongledeptrai',
    apiRoot: 'https://ppnbank.herokuapp.com/api',
  },
  CryptoBank: {
    bank_code: 'CryptoBank', // team Dang Thanh Tuan
    secret: 'CryptoBank_secret',
    apiRoot: 'https://crypto-bank-1612785.herokuapp.com/api',
  },
  LocalBank: {
    // test PGP local
    bank_code: 'LocalBank',
    secret: 'LocalBank_secret',
    apiRoot: '',
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
const rsaPublicKey = new nodeRSA().importKey(rsaPublicKeyString);
const partnerRSAPublicKey = new nodeRSA().importKey(parterRsaPublicKeyString);

// implement
function checkSecurity(req, isMoneyAPI = false) {
  const { bank_code, sig, ts } = req.headers;
  // check partner code
  if (!PARTNERS[bank_code]) throw new Error('Your bank_code is not correct.');
  // check time in 5 minute
  if (Date.now() - parseInt(ts) > 1000 * 60 * 5) throw new Error('Time exceed.');
  // check signature. If money API then ignore check here
  if (isMoneyAPI) return;
  const sigString = bank_code + ts.toString() + JSON.stringify(req.body) + MY_BANK_SECRET;
  const hashString = hash.MD5(sigString);
  if (sig !== hashString) throw new Error('Signature failed.');
}

async function verifySig(req) {
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
          // const genSig = rsaPrivateKey.sign(hashString, 'hex', 'hex');
          // console.log('genSig', genSig);
          const verification_result = partnerRSAPublicKey.verify(hashString, sig, 'hex', 'hex');
          console.log('verify', verification_result)
          if (!verification_result) {
            throw new Error('Verify your RSA signature failed.');
          }
        }
        break;
      case 'LocalBank':
        {
          const sigString = bank_code + ts.toString() + JSON.stringify(req.body) + MY_BANK_SECRET;
          const hashString = hash.MD5(sigString); // return hex encoding string
          console.log("hashString", hashString);

          const privateKeyArmored = pgpPrivateKeyString;
          const publicKeyArmored = pgpPublicKeyString;
          const passphrase = 'Hiphop_never_die';

          // signing
          const {
            keys: [privateKey],
          } = await openpgp.key.readArmored(privateKeyArmored);
          await privateKey.decrypt(passphrase);
          const { data: genSig } = await openpgp.sign({
            message: openpgp.cleartext.fromText(hashString), // CleartextMessage or Message object
            privateKeys: [privateKey], // for signing
          });

          // verifying PGP signed message
          const verified = await openpgp.verify({
            message: await openpgp.cleartext.readArmored(genSig), // parse armored message
            publicKeys: (await openpgp.key.readArmored(publicKeyArmored)).keys, // for verification
          });
          console.log('verified', verified);
          const { valid } = verified.signatures[0];
          if (!valid) {
            throw new Error('PGP signature could not be verified');
          }
        }
        break;
      default:
        throw new Error("Bank code is not correct.");
    }
  } catch (err) {
    throw new Error(err.message);
  }
}

// function getBankDetail(partner_code) {
//   const data = {};
//   const ts = Date.now().toString();
//   const sigString = MY_BANK_CODE + ts + JSON.stringify(data) + partners[partner_code].secret;
//   const sig = hash.MD5(sigString);
//   const headers = {
//     bank_code,
//     ts,
//     sig,
//   };

//   const instance = axios.create({
//     baseURL: 'http://localhost:3001/',
//     timeout: 3000,
//     headers,
//   });
//   instance.post('/', data).then((res) => {
//     console.log(res);
//   });
// }

module.exports = {
  // cho phep doi tac goi vao api nay de lay thong tin
  bankDetail: async (req, res) => {
    try {
      const { account_number } = req.body;
      console.log(req.body);
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
  internalBankDetail: async (req, res) => {
    try {
      const { account_number } = req.body;
      console.log(req.body);
      if (!account_number) throw new Error('account_number is missing in request body.');

      // checkSecurity(req);
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
    const { bank_code, account_number } = req.body;
    console.log('body', req.body);
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

          const headers = {
            ts,
            partnerCode,
            sig,
          };

          superagent
            .post(`${PARTNERS[bank_code].apiRoot}/accounts/PPNBankDetail`)
            .send(body)
            .set(headers)
            .end((err, result) => {
              // if (err) res.status(201).json({ message: 'Đã xảy ra lỗi khi tìm thông tin ngân hàng đối tác' });
              if (err) {
                console.log(err);
                res.status(404).json({ message: "Khong tim thay thong tin" });
                return;
              }
              const name = JSON.parse(result.res.text || {}).name || 'Không tìm thấy thông tin';
              res.status(200).json({ account_number, name });
            });
        }
        break;
      case 'LocalBank':
        {
          console.log('localbank');
        }
        break;
      default:
        console.log('ERR bank_code wrong');
    }

    // res.json({});
  },
  internalMoneyTransfer: async (req, res) => {
    // api noi bo
    // lay bank_code sau do goi api cua partner de thuc hien y/c chuyen tien
    try {
      const { bank_code } = req.body;
      switch (bank_code) {
        case "TUB":
          {
            const { amount, content, transferer, receiver, payFee } = req.body;
            if (isNaN(amount)) throw new Error('There is error in your request body.');
            const receiverAcc = await customerModel.getCustomerByAccount(receiver);
            const transfererAcc = await customerModel.getCustomerByAccount(transferer);
            if (!receiverAcc || !transfererAcc) throw new Error('Account not found.');

            const date = Date.now().toString();
            let isTrasfered = false;
            const payFeeBy = payFee;
            const type = {
              name: 'receive',
              bankCode: bank_code,
            };
            const transfererBalance = parseInt(transfererAcc.checkingAccount.amount);
            const receiverBalance = parseInt(receiverAcc.checkingAccount.amount);
            if (transfererBalance >= parseInt(amount)) {
              await customerModel.updateCheckingAmount(receiver, receiverBalance + amount);
              await customerModel.updateCheckingAmount(transferer, transfererBalance - amount);
              isTrasfered = true;
            } else {
              throw new Error('Tài khoản người gửi không đủ tiền.');
            }

            await dealModel.addDeal(receiver, transferer, date, amount, content, isTrasfered, payFeeBy, type);
            res.status(200).json({ message: 'Transfer money done' });
          }
          break;
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
              depositor: transferer,
              receiver: receiver,
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
              .post(`${PARTNERS[bank_code].apiRoot}/services/deposits/account_number/${receiver.account_number}`, body, {
                headers: headers,
              })
              .then((res) => {
                console.log('resss', res);
                res.json(res.data);
              })
              .catch((err) => console.log('ERR', err.message));
          }
          break;
        case 'PPNBank':
          {
            const { bank_code, content, amount, transferer, receiver, payFee } = req.body;
            // sign
            const ts = moment().valueOf();
            const body = {
              amount,
              content,
              transferer,
              receiver,
              payFee,
            };
            const hashString = hash.MD5(MY_BANK_CODE + ts + JSON.stringify(body) + PARTNERS.PPNBank.secret);
            const sig = rsaPrivateKey.sign(hashString, 'hex', 'hex');
            const headers = {
              ts,
              bank_code: MY_BANK_CODE,
              sig,
            };
            let isTrasfered = false;
            const date = Date.now().toString();
            const payFeeBy = payFee;
            const type = {
              name: 'transfer',
              bankCode: bank_code,
            };

            superagent
              .post(`${PARTNERS[bank_code].apiRoot}/accounts/receive`)
              .send(body)
              .set(headers)
              .end(async (err, result) => {
                if (err) throw new Error(err.message);
                console.log('res chuyen tien', result);
                const account = await customerModel.getCustomerByAccount(transferer);
                const balance = parseInt(account.checkingAccount.amount);
                const newAmount = balance - amount;
                await customerModel.updateCheckingAmount(transferer, newAmount);
                isTrasfered = true;
                await dealModel.addDeal(receiver, transferer, date, amount, content, isTrasfered, payFeeBy, type);
                res.status(200).json({ message: 'Transfer money done' });
              });
          }
          break;
        case 'LocalBank':
          {
          }
          break;
        default:
          console.log('ERR bank_code wrong');
          res.status(401).json({ message: "ERR bank_code wrong" });
      }
    }
    catch (err) { res.status(400).json({ message: err.message }) }
  },
  // doi tac goi vao de chuyen tien
  moneyTransfer: async (req, res) => {
    try {
      await verifySig(req);
      const { amount, content, transferer, receiver, payFee } = req.body;
      if (isNaN(amount)) throw new Error('There is error in your request body.');
      const account = await customerModel.getCustomerByAccount(receiver);
      if (!account) throw new Error('Account not found.');

      const date = Date.now().toString();
      let isTrasfered = false;
      const payFeeBy = payFee;
      const type = {
        name: 'receive',
        bankCode: req.headers.bank_code,
      };
      const balance = parseInt(account.checkingAccount.amount);
      if (amount > 0) {
        // cong tien
        const newAmount = balance + amount;
        await customerModel.updateCheckingAmount(receiver, newAmount);
        isTrasfered = true;
      } else {
        throw new Error('There is error in your request body.');
      }

      // await dealModel.addDeal(receiver, transferer, date, amount, content, isTrasfered, payFeeBy, type);
      res.status(200).json({ message: 'Transfer money done' });
    } catch (err) {
      console.log("errorrr", err);
      res.status(400).json({ message: err.message, headers: req.headers });
    }
  },
};
