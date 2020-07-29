const nodemailer = require("nodemailer");
const crypto = require("crypto");
const async = require("async");

const DebtReminder = require("../models/debt-reminder.model");
const Notification = require("../models/notifications.model");
const Customer = require("../models/customer.model");

module.exports = {
  createReminder: async (req, res) => {
    const {
      creator,
      nameCreator,
      nameDebtor,
      debtor,
      debt,
      content,
    } = req.body;

    if (!(creator && debtor && debt))
      res.status(400).json({ message: "Missing infomations" });
    var date = new Date();
    var timeCreate =
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
    const newReminder = {
      creator,
      nameCreator,
      debtor,
      nameDebtor,
      content,
      debt,
      timeCreate,

      pay: {
        isPaid: false,
        timePay: null,
      },
      deleteReminder: {
        isDeleted: false,
        timeDelete: null,
        isDeleteBy: null,
      },
    };

    const ret = DebtReminder.createReminder(newReminder);
    if (ret) res.status(201).json({ message: "Thêm thành công" });
    else {
      res.status(400).json({ message: "Thêm thất bại" });
    }
  },
  getListRemindersByAccount: async (req, res) => {
    const account = await Customer.findOneUserName(req.payload.username);
    console.log(account);
    const listReminders = await DebtReminder.getListRemindersByAccount(
      account.checkingAccount.accountNumber
    );
    if (!listReminders) {
      return res.json({
        status: "failed",
        code: 2022,
      });
    }
    return res.json({
      status: "success",
      code: 2020,
      message: "Lấy danh sách nhắc nợ thành công!",
      listReminders,
    });
  },
  cancelReminder: async (req, res) => {
    const reminderId = req.params.id;

    const {
      accountNumber,
      name,
      accountNumberReceiver,
      content,
      types,
    } = req.body;
    console.log(types);
    if (types === 1)
      var con = name + " đã hủy nhắc nợ mà bạn đã tạo với nội dung: " + content;
    else var con = name + " đã hủy nhắc với của bạn nội dung: " + content;

    var date = new Date();
    var time =
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
    const ret = await DebtReminder.cancelReminder(
      reminderId,
      accountNumber,
      name
    );
    var ret1 = await Notification.addNotification(
      accountNumberReceiver,
      con,
      time,
      "delete"
    );

    if (ret)
      res.status(200).json({
        status: true,
        message: "Hủy trả nợ thành công!",
      });
    else {
      res.status(400).json({
        status: false,
        message: "Hủy trả nợ thất bại!",
      });
    }
  },
  completeReminder: async (req, res) => {
    const reminderId = req.params.id;

    // // change pay status
    const ret = await DebtReminder.completeReminder(reminderId);
    if (ret)
      res.status(200).json({ status: true, message: "Trả nợ thành công!" });
    else res.status(400).json({ status: fasle, message: "Trả nợ thất bại" });
  },
};
