const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const checkingAccount0 = new Schema({
    accountNumber: { type: String, required: true },
    amount: { type: String, required: true },
});
const savingAccount = new Schema({
    accountNumber: { type: String, required: true },
    amount: { type: String, required: true },
});
const customerSchema = new Schema({
    name: { type: String, required: true, trim: true },
    checkingAccount: {type: checkingAccount0, required: true},
    savingsAccount:{ type: [savingAccount]},
});

const Customer = mongoose.model("Customer", customerSchema, "customers");

//lấy customer theo accountNumber checkingAccount
const getCustomer= async(_accountNumber)=>{
    try {
        const customer = await Customer.findOne({'checkingAccount.accountNumber' : _accountNumber});
        //      listAllCustomers instanceof mongoose.Query; // true
        //    const reslt= await listAllCustomers;
        return customer;
    } catch (e) {
        console.log("ERROR: " + e);
        return 0;
    }
}
//lấy list customer
const getListCustomers = async () => {
    try {
        const listAllCustomers = await Customer.find();
        //      listAllCustomers instanceof mongoose.Query; // true
        //    const reslt= await listAllCustomers;
        return listAllCustomers;
    } catch (e) {
        console.log("ERROR: " + e);
        return 0;
    }
    
}
module.exports = {
    Customer,
    getCustomer,
    getListCustomers,
}