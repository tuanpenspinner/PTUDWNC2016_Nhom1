const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const checkingAccount0 = new Schema({
  accountNumber: { type: String, required: true, trim: true},
  amount: { type: Number, min: 0, default: 0, required: true },
});
const savingAccount = new Schema({
  accountNumber: { type: String, required: true, trim: true },
  amount: { type: Number, min: 0, required: true },
});
const receiver = new Schema({
  accountNumber: { type: String, required: true, trim: true}, //số tài khoản thanh toán của người nhận
  name: { type: String, required: true},  //tên thay thế của người nhận
});
const moneyRecharge = new Schema({
  amount: {type: Number, required: true}, //số tiền nạp vào
  dateRecharge: {type: Date, required: true},
  accountNumber: {type: String, required: true},  //số tài khoản được nạp tiền
});
const customerSchema = new Schema({
  name: { type: String, required: true},
  usermame: { type: String, required: true, trim: true},
  password: {type: String, required: true, minlength: 6},
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  checkingAccount: { type: checkingAccount0, required: true },
  savingsAccount: { type: [savingAccount] },
  listReceivers: {type: [receiver]},  //danh sách người nhận
  historyMoneyRecharge: {type: [moneyRecharge]},  //lịch sử nạp tiền
});

const Customer =mongoose.model('Customer', customerSchema, 'customers');

module.exports = {
  //lấy customer theo accountNumber checkingAccount
  getCustomer: async (_accountNumber) => {
    try {
      const customer = await Customer.findOne({ 'checkingAccount.accountNumber': _accountNumber });
      //      listAllCustomers instanceof mongoose.Query; // true
      //    const reslt= await listAllCustomers;
      // console.log(customer);
      return customer;
    } catch (e) {
      console.log('ERROR: ' + e);
      return 0;
    }
  },
  //lấy list customer
  getListCustomers: async () => {
    try {
      const listAllCustomers = await Customer.find();
      //      listAllCustomers instanceof mongoose.Query; // true
      //    const reslt= await listAllCustomers;
      return listAllCustomers;
    } catch (e) {
      console.log('ERROR: ' + e);
      return 0;
    }
  },

  updateCheckingAmount: async (_accountNumber, _newAmount) => {
    try {
      const u = await Customer.update(
        { 'checkingAccount.accountNumber': _accountNumber },
        { 'checkingAccount.amount': _newAmount },
      );
      // console.log('uupdate', u);
    } catch (err) {
      console.log('ERR', err.message);
    }
  },
};
