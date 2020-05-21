const fs = require('fs');
const jwt = require('jsonwebtoken');
const nodeRSA = require('node-rsa');
const md5 = require('crypto-js/md5');
// RSA key-pair
const rsaPrivateKey = fs.readFileSync('rsa_private.key', 'utf8');
const rsaPublicKey = fs.readFileSync('rsa_public.key', 'utf8');
// console.log('prikey', rsaPrivateKey);

const payload = {};
payload.field1 = 'ahihi';
payload.filed2 = 'you idiot';
// console.log('payload', JSON.stringify(payload));

// load key from PEM string
const pubKeyRSA = new nodeRSA(rsaPublicKey);
const priKeyRSA = new nodeRSA(rsaPrivateKey);
console.log('pubkey', pubKeyRSA.isEmpty());
console.log('prikey', priKeyRSA.isEmpty());

// Hash kiem tra goi tin nguyen ban hay khong
// Create signature
// header.sig header.ts body.json
// make API request using axios
const date = Date.now().toString();
const secret = 'TUB';
// console.log('md5', md5(date + secret).toString());

//test JWT
// Sign
const signOptions = {
  issuer: 'Nhom_1_Hiphop_never_die', // my team
  subject: 'congtuyen598@gmail.com', // intended user of the token
  audience: 'example.com',
  expiresIn: '5m',
  algorithm: 'RS256',
};

const token = jwt.sign(payload, rsaPrivateKey, signOptions);
// console.log('token', token);

// Verify token
const verifyOptions = {
  issuer: 'Nhom_1_Hippop_never_die', // partner team
  subject: 'congtuyen598@gmail.com',
  audience: 'example.com',
  maxAge: '5m',
  algorithms: ['RS256'],
};

jwt.verify(token, rsaPublicKey, verifyOptions, (err, payload) => {
  if (err) {
    console.log('verify error', err.name, err.message);
  } else {
    // console.log('verified', payload);
  }
});

// decode, don't need public key
const decoded = jwt.decode(token, { complete: true });
// console.log('decoded', decoded);

// implement

module.exports = {
  bankDetail: (req, res) => {
    console.log(req.headers);
    res.send('bank detail here');
  },
  moneyTransfer: (req, res) => {
    //
    console.log('Money transfer', key.isPrivate(), key.isPublic(), key.isEmpty());
    res.send('money transfer done');
  },
};
