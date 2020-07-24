const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paySchema = new Schema(
  {
    isPaid: { type: Boolean, default: false, required: true },
    timePay: { type: String },
  },
  { _id: false }
);

const deleteReminderSchema = new Schema(
  {
    isDeleted: { type: Boolean, default: false, required: true },
    timeDelete: { type: String },
    isDeleteBy: { type: String },
    nameDelete: { type: String },
  },
  { _id: false }
);

const debtReminderSchema = new Schema({
  creator: { type: String, required: true },
  debtor: { type: String, required: true },
  nameCreator: { type: String, required: true },
  nameDebtor: { type: String, required: true },

  debt: { type: Number, required: true },
  content: { type: String },
  timeCreate: { type: String },
  pay: { type: paySchema },
  deleteReminder: { type: deleteReminderSchema },
});

const debtReminder = mongoose.model(
  "debtReminder",
  debtReminderSchema,
  "debt-reminders"
);

module.exports = {
  createReminder: async (entity) => {
    try {
      const reminder = new debtReminder(entity);
      await reminder.save();
      return true;
    } catch (e) {
      return false;
      console.log("ERROR: " + e.message);
    }
  },
  getReminderById: async (id) => {
    const reminder = await debtReminder.findOne({ _id: id });
    if (reminder) return true;
    else return false;
  },
  getListRemindersByAccount: async (account_number) => {
    const listOfMe = await debtReminder.find({ creator: account_number });
    const listOfOthers = await debtReminder.find({ debtor: account_number });
    return { listOfMe, listOfOthers };
  },
  cancelReminder: async (id, accountNumber, name) => {
    var date = new Date();
    var timeCancel =
      ("00" + date.getHours()).slice(-2) +
      ":" +
      ("00" + date.getMinutes()).slice(-2) +
      ":" +
      ("00" + date.getSeconds()).slice(-2) +
      " " +
      ("00" + date.getDate()).slice(-2) +
      "/" +
      ("00" + (date.getMonth() + 1)).slice(-2) +
      "/" +
      date.getFullYear();
    try {
      const ret = await debtReminder.updateOne(
        { _id: id },
        {
          deleteReminder: {
            isDeleted: true,
            timeDelete: timeCancel,
            isDeleteBy: accountNumber,
            nameDelete: name,
          },
        }
      );
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  completeReminder: async (id) => {
    var date = new Date();
    var timePay=
      ("00" + date.getHours()).slice(-2) +
      ":" +
      ("00" + date.getMinutes()).slice(-2) +
      ":" +
      ("00" + date.getSeconds()).slice(-2) +
      " " +
      ("00" + date.getDate()).slice(-2) +
      "/" +
      ("00" + (date.getMonth() + 1)).slice(-2) +
      "/" +
      date.getFullYear();
    const ret = await debtReminder.updateOne(
      { _id: id },
      { pay: { isPaid: true, timePay: timePay } }
    );
    if (ret) return true;
    else return false;
  },
  //lấy lịch sử thanh toán nợ
  getHistoryPayDebt: async (accountNumber) => {
    try {
      const resultHistoryPayDebt = await debtReminder.find({
        $or: [
          { creator: accountNumber, "pay.isPaid": true },
          { debtor: accountNumber, "pay.isPaid": true },
        ],
      });
      return resultHistoryPayDebt;
      // console.log('uupdate', u);
    } catch (err) {
      console.log("ERR", err.message);
    }
  },
};
