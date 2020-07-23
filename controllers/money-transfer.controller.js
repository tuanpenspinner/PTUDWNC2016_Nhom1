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
    // test PGP local - internal bank
    // LocalBank la mot partner (PGP) do TUB tu xay dung, demo chuyen tien tu TUB(client) -> LocalBank(TUB server)
    bank_code: 'LocalBank',
    secret: 'LocalBank_secret',
    apiRoot: 'http://localhost:3001/api',
  },
  TUB: {
    // my bank - just to handle PGP call that come from TUB client
    // TUB here is a partner of LocalBank (TUB server)
    bank_code: "TUB"
  }
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
  console.log("check secure info", bank_code, sig, ts);
  if (!PARTNERS[bank_code]) throw new Error('Your bank_code is not correct');
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
      case 'TUB': // just for demo PGP request from internal bank
        {
          const sigString = bank_code + ts.toString() + JSON.stringify(req.body) + MY_BANK_SECRET;
          const hashString = hash.MD5(sigString); // return hex encoding string
          console.log("hashString in verifySig", hashString);

          const publicKeyArmored = pgpPublicKeyString;

          // verifying PGP signed message
          const verified = await openpgp.verify({
            message: await openpgp.cleartext.readArmored(JSON.parse(sig)), // parse armored message
            publicKeys: (await openpgp.key.readArmored(publicKeyArmored)).keys, // for verification
          });
          console.log('verified', verified);
          const { valid } = verified.signatures[0];
          console.log("verify result", valid);
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
      res.status(404).json({ message: `${err.message}` });
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
      res.status(404).json({ message: `${err.message}` });
    }
  },
  partnerBankDetail: (req, res) => {
    // api noi bo - get thong tin tai khoan ngan hang partners
    // body = { bank_code, account_number }
    const { bank_code, account_number } = req.body;
    switch (bank_code) {
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
              if (err) {
                console.log(err);
                res.status(404).json({ message: "Đã xảy ra lỗi khi tìm thông tin ở ngân hàng đối tác" });
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
        res.status(400).json({ message: 'ERR bank_code wrong' });
    }
  },
  internalMoneyTransfer: async (req, res) => {
    // api noi bo
    // lay bank_code sau do goi api cua partner de thuc hien y/c chuyen tien
    try {
      const { bank_code } = req.body;
      switch (bank_code) {
        case "TUB": // chuyen tien noi bo
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
              name: 'internal',
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
            const hashString = hash.MD5(MY_BANK_CODE + ts + JSON.stringify(body) + PARTNERS[bank_code].secret);
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
                try {
                  if (err) throw new Error(err.message);
                  const account = await customerModel.getCustomerByAccount(transferer);
                  const balance = parseInt(account.checkingAccount.amount);
                  const newAmount = balance - amount;
                  await customerModel.updateCheckingAmount(transferer, newAmount);
                  isTrasfered = true;
                  await dealModel.addDeal(receiver, transferer, date, amount, content, isTrasfered, payFeeBy, type);
                  res.status(200).json({ message: 'Transfer money done' });
                }
                catch (err) {
                  res.status(400).json({ message: err.message });
                }
              });
          }
          break;
        case 'LocalBank':
          {
            const { bank_code, content, amount, transferer, receiver, payFee } = req.body;

            // signing PGP
            const ts = moment().valueOf();
            const body = {
              amount,
              content,
              transferer,
              receiver,
              payFee,
            };
            const sigString = MY_BANK_CODE + ts + JSON.stringify(body) + PARTNERS[bank_code].secret;
            const hashString = hash.MD5(sigString); // return hex encoding string
            // console.log("hashString real", hashString);

            const privateKeyArmored = pgpPrivateKeyString;
            // const publicKeyArmored = pgpPublicKeyString;
            const passphrase = 'Hiphop_never_die';

            // signing
            const {
              keys: [privateKey],
            } = await openpgp.key.readArmored(privateKeyArmored);
            await privateKey.decrypt(passphrase);
            const { data: sig } = await openpgp.sign({
              message: openpgp.cleartext.fromText(hashString), // CleartextMessage or Message object
              privateKeys: [privateKey], // for signing
            });
            // console.log("genSIG real", JSON.stringify(sig));

            const headers = {
              ts,
              bank_code: MY_BANK_CODE,
              sig: JSON.stringify(sig)
            };
            let isTrasfered = false;
            const date = Date.now().toString();
            const payFeeBy = payFee;
            const type = {
              name: 'transfer',
              bankCode: bank_code,
            };

            superagent
              .post(`${PARTNERS[bank_code].apiRoot}/money-transfer`)
              .send(body)
              .set(headers)
              .end(async (err, result) => {
                try {
                  if (err) throw new Error(err.message);
                  const account = await customerModel.getCustomerByAccount(transferer);
                  const balance = parseInt(account.checkingAccount.amount);
                  const newAmount = balance - amount;
                  await customerModel.updateCheckingAmount(transferer, newAmount);
                  isTrasfered = true;
                  await dealModel.addDeal(receiver, transferer, date, amount, content, isTrasfered, payFeeBy, type);
                  res.status(200).json({ message: 'Transfer money done' });
                }
                catch (err) {
                  res.status(400).json({ message: err.message });
                }
              });
          }
          break;
        default:
          console.log('ERR bank_code wrong');
          res.status(400).json({ message: "ERR bank_code wrong" });
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

      await dealModel.addDeal(receiver, transferer, date, amount, content, isTrasfered, payFeeBy, type);
      res.status(200).json({ message: 'Transfer money done' });
    } catch (err) {
      console.log("ERROR FINAL", err.message);
      res.status(400).json({ message: err.message });
    }
  },
};
