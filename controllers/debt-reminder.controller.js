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
    console.log(reminderId);
    // const reminder = await DebtReminder.getReminderById(reminderId);
    // if (!reminder) res.status(404).json({ message: "Không tìn thấy id" });

    // const debtor = await Customer.getCustomerByAccount(reminder.debtor);
    // const userMail = debtor.email;
    // const accountNumber = debtor.checkingAccount.accountNumber;

    // console.log(debtor);
    // send mail OTP
    // async.waterfall(
    //   [
    //     function (done) {
    //       let otp = Math.floor(Math.random() * 9999 + 1);
    //       done(err, otp);
    //     },
    //     function (otp, done) {
    //       Customer.updateMailOTP(accountNumber, otp)
    //         .then(() => {
    //           done(null, otp);
    //         })
    //         .catch((err) => {
    //           throw err.message;
    //         });
    //     },
    //     function (otp) {
    //       let transporter = nodemailer.createTransport({
    //         service: "Gmail",
    //         secure: true, // true for 465, false for other ports
    //         auth: {
    //           user: process.env.EMAIL_SENDER,
    //           pass: process.env.EMAIL_PASSWORD,
    //         },
    //       });

    //       let mailOptions = {
    //         to: userMail,
    //         from: `"TUB Internet Banking" <${process.env.EMAIL_SENDER}>`,
    //         subject: "TUB Internet Banking | Confirm your transfer",
    //         text:
    //           "You are receiving this because you (or someone else) have requested the complete debt reminder for your account.\n\n" +
    //           "Please use the following OTP to complete the process:\n" +
    //           otp +
    //           "\n\n" +
    //           "If you did not request this, please ignore this email and your account will remain uncharged.\n",
    //       };
    //       transporter.sendMail(mailOptions, function (err) {
    //         console.log("ERR", err.message, process.env.EMAIL_SENDER);
    //       });

    //       console.log("gui mail otp done to email: ", userMail);
    //       // res.status(200).json({ message: 'An email has sent to your email' });
    //     },
    //   ],
    //   function (err, result) {
    //     if (err) throw err;
    //   }
    // );

    // // change pay status
    const ret = await DebtReminder.completeReminder(reminderId);
    if (ret)
      res.status(200).json({ status: true, message: "Trả nợ thành công!" });
    else res.status(400).json({ status: fasle, message: "Trả nợ thất bại" });
  },
};
