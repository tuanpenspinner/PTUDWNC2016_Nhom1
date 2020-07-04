const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const checkingAccount0 = new Schema(
  {
    accountNumber: { type: String, required: true, trim: true },
    amount: { type: Number, min: 0, default: 0, required: true },
  },
  {
    _id: false,
  }
);
const savingAccount = new Schema(
  {
    accountNumber: { type: String, required: true, trim: true },
    amount: { type: Number, min: 0, required: true },
  },
  {
    _id: false,
  }
);
const receiver = new Schema(
  {
    accountNumber: { type: String, required: true, trim: true }, //số tài khoản thanh toán của người nhận
    name: { type: String, required: true }, //tên thay thế của người nhận
  },
  {
    _id: false,
  }
);
const moneyRecharge = new Schema(
  {
    amount: { type: Number, required: true }, //số tiền nạp vào
    dateRecharge: { type: Date, required: true },
    accountNumber: { type: String, required: true }, //số tài khoản được nạp tiền
  },
  {
    _id: false,
  }
);
const mailOtp = new Schema(
  {
    otp: { type: String },
    issueAt: { type: Number }, // millisenconds
  },
  {
    _id: false,
  }
);
const customerSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  refreshToken: { type: String, default: null },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  mailOtp: { type: mailOtp, default: null },
  checkingAccount: { type: checkingAccount0, required: true },
  savingsAccount: { type: [savingAccount] },
  listReceivers: { type: [receiver] }, //danh sách người nhận
  historyMoneyRecharge: { type: [moneyRecharge] }, //lịch sử nạp tiền
});

const Customer = mongoose.model("Customer", customerSchema, "customers");

module.exports = {
  // Đăng kí tài khoản customer
  registerCustomer: async (entity) => {
    try {
      const hash = bcrypt.hashSync(entity.password, 10);
      entity.password = hash;
      var user = new Customer(entity);
      await user.save();
    } catch (e) {
      console.log("ERROR: " + e.message);
    }
  },

  // Tìm 1 tài khoản customer theo tên
  findOneUserName: async (username) => {
    try {
      let user = await Customer.findOne({ username: username });
      return user;
    } catch (e) {
      console.log("ERROR: " + e);
    }
  },
  // tìm 1 tài khoản customer theo checkingAccountNumber
  findOneCheckingAccount: async (username, accountNumber) => {
    try {
      let user = await Customer.findOne({
        username: username,
        "checkingAccount.accountNumber": accountNumber,
      });
      return user;
    } catch (e) {
      console.log("ERROR: " + e.message);
    }
  },
  // tìm 1 tài khoản customer theo savingAccountNumber
  findOneSavingAccount: async (username, accountNumber) => {
    try {
      let user = await Customer.findOne({
        username: username,
        "savingsAccount.accountNumber": accountNumber,
      });
      return user;
    } catch (e) {
      console.log("ERROR: " + e.message);
    }
  },
  // Đăng nhập tài khoản customer
  loginCustomer: async (entity) => {
    const customerExist = await Customer.findOne({ username: entity.username });
    if (customerExist === null) return null;
    const password = customerExist.password;
    if (bcrypt.compareSync(entity.password, password)) {
      return customerExist;
    }
    return null;
  },
  // Đổi mật khẩu tài khoản customer
  changePasswordCustomer: async (entity) => {
    console.log(entity)
    const customerExist = await Customer.findOne({ username: entity.username });
    if (customerExist === null) return null;
    const password = customerExist.password;
    if (bcrypt.compareSync(entity.password, password)) {
      const hash = bcrypt.hashSync(entity.newPassword, 10);

      await Customer.findOneAndUpdate(
        { username: entity.username },
        {
          password: hash,
        }
      );
      return true;
    }
    return null;
  },
  resetPassword: async (entity) => {
    const customerExist = await Customer.findOne({ username: entity.username });
    if (customerExist === null) return null;
    else {
      const hash = bcrypt.hashSync(entity.newPassword, 10);
      await Customer.findOneAndUpdate(
        { username: entity.username },
        {
          password: hash,
        }
      );
      return true;
    }
  },

  updateNameCustomer: async (username,name) => {
    const customerExist = await Customer.findOneAndUpdate({ username: username },{name});
    if (customerExist === null) return null;
    else {
      return true;
    }
  },
  //Tạo mã OTP
  otpGenerate: async () => {
    const OTP = Math.floor(Math.random() * (999999 - 100000) + 100000);
    return OTP;
  },
  saveOTP: async (username, otp, email) => {
    issueAt = Date.now();
    const customer = await Customer.findOne({ username: username });
    if (email !== customer.email) return false;
    const ret = await Customer.updateOne(
      { username: username },
      { mailOtp: { otp, issueAt } }
    );
    return true;
  },

  //Gửi mã OTP đễn email customer
  sendOTP: async (email, OTP) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "internetbankingnhom1@gmail.com",
        pass: "nhom1234",
      },
    });

    var mailOptions = {
      from: "internetbankingnhom1@gmail.com",
      to: email,
      subject: "Forget password",
      text: "OTP Code",
      html: `<p>Mã OTP để reset password của bạn là: <b> ${OTP} </b></p><br> <p>Mã có thời hạn trong vòng 3 phút</p>`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    return true;
  },
  //Xác nhận mã OTP
  otpValidateAndResetPassword: async (OTP, username) => {
    const ret = await Customer.findOne({
      username: username,
    });
    if (
      Date.now() - ret.mailOtp.issueAt > 1000 * 60 * 3 ||
      ret.mailOtp.otp !== OTP
    )
      return false;
    return true;
  },
  updateRefreshToken: async (username, refreshToken) => {
    try {
      await Customer.findOneAndUpdate(
        { username: username },
        { refreshToken: refreshToken }
      );
    } catch (e) {
      console.log("ERROR: " + e);
      return 0;
    }
  },
  verifyRefreshToken: async (username, refreshToken) => {
    const ret = await Customer.findOne({ username: username });
    const compare = refreshToken === ret.refreshToken;
    if (compare) return true;

    return null;
  },

  //lấy customer theo accountNumber checkingAccount
  getCustomerByAccount: async (_accountNumber) => {
    try {
      const customer = await Customer.findOne({
        "checkingAccount.accountNumber": _accountNumber,
      });
      //      listAllCustomers instanceof mongoose.Query; // true
      //    const reslt= await listAllCustomers;
      // console.log(customer);
      return customer;
    } catch (e) {
      console.log("ERROR: " + e);
      return 0;
    }
  },

  //lấy list customer
  getListCustomers: async () => {
    try {
      const listAllCustomers = await Customer.find(
        {},
        "username name phone email checkingAccount.accountNumber savingsAccount.accountNumber"
      );
      //      listAllCustomers instanceof mongoose.Query; // true
      //    const reslt= await listAllCustomers;
      return listAllCustomers;
    } catch (e) {
      console.log("ERROR: " + e);
      return 0;
    }
  },

  updateCheckingAmount: async (_accountNumber, _newAmount) => {
    try {
      const u = await Customer.update(
        { "checkingAccount.accountNumber": _accountNumber },
        { "checkingAccount.amount": _newAmount }
      );
      // console.log('uupdate', u);
    } catch (err) {
      console.log("ERR", err.message);
    }
  },

  updateSavingAmount: async (_username, _accountNumber, _newAmount) => {
    try {
      const u = await Customer.updateOne(
        { "savingsAccount.accountNumber": _accountNumber, username: _username },
        { $set: { "savingsAccount.$.amount": _newAmount } }
      );
    } catch (err) {
      console.log("ERR", err.message);
    }
  },

  //thêm lịch sử nạp tiền
  addHistoryRecharge: async (username, amount, accountNumber, date) => {
    try {
      const u = await Customer.updateOne(
        { username: username },
        {
          $push: {
            historyMoneyRecharge: {
              amount: amount,
              accountNumber: accountNumber,
              dateRecharge: date,
            },
          },
        }
      );
    } catch (err) {
      console.log("ERR", err.message);
    }
  },

  // update mail OTP by account number
  updateMailOTP: async (accountNumber, otp) => {
    issueAt = Date.now();
    await Customer.updateOne(
      { "checkingAccount.accountNumber": accountNumber },
      { mailOtp: { otp, issueAt } }
    );
  },

  checkMailOTP: async (accountNumber, otp) => {
    const mailOtp = await Customer.updateOne(
      { "checkingAccount.accountNumber": accountNumber },
      { mailOtp: { otp, issueAt } }
    );
    console.log(mailOtp);
    if (Date.now() - mailOtp.issueAt > 1000 * 60 * 3 || mailOtp.otp !== otp)
      return false;
    return true;
  },
};
