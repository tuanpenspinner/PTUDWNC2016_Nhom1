const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const checkingAccount0 = new Schema({
  accountNumber: { type: String, required: true },
  amount: { type: Number, min: 0, default: 0, required: true },
});
const savingAccount = new Schema({
  accountNumber: { type: String, required: true },
  amount: { type: Number, min: 0, required: true },
});
const customerSchema = new Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  checkingAccount: { type: checkingAccount0, required: true },
  savingsAccount: { type: [savingAccount] },
});

const Customer = mongoose.model('Customer', customerSchema, 'customers');

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
