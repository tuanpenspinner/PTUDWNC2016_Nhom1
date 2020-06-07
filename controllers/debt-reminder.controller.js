const nodemailer = require('nodemailer');
const crypto = require('crypto');
const async = require('async');

const DebtReminder = require('../models/debt-reminder.model');
const Customer = require('../models/customer.model');

module.exports = {
  createReminder: async (req, res) => {
    const { creator, debtor, debt, content } = req.body;
    if (!(creator && debtor && debt)) res.status(400).json({ message: 'Missing infomations' });
    const timeCreate = new Date().toString();
    const newReminder = {
      creator,
      debtor,
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
    DebtReminder.createReminder(newReminder);
    res.status(201).end();
  },
  getListRemindersByAccount: async (req, res) => {
    const accountNumber = req.params.accountNumber;
    const listReminders = await DebtReminder.getListRemindersByAccount(accountNumber);
    res.status(200).json(listReminders);
  },
  cancelReminder: async (req, res) => {
    const reminderId = req.params.id;
    const accountNumber = req.body.account_number;
    await DebtReminder.cancelReminder(reminderId, accountNumber);
    res.status(200).end();
  },
  completeReminder: async (req, res) => {
    const reminderId = req.params.id;
    const reminder = await DebtReminder.getReminderById(reminderId);
    if (!reminder) res.status(404).end();

    const debtor = await Customer.getCustomerByAccount(reminder.debtor);
    const { email: userMail, accountNumber } = debtor; // Renaming Variables while Destructuring

    // send mail OTP
    async.waterfall(
      [
        function (done) {
          crypto.randomBytes(4, function (err, buf) {
            let otp = Math.floor(Math.random() * 9999 + 1);
            done(err, otp);
          });
        },
        function (otp, done) {
          Customer.updateMailOTP(accountNumber, otp)
            .then(() => {
              done(null, otp);
            })
            .catch((err) => {
              throw err.message;
            });
        },
        function (otp) {
          let transporter = nodemailer.createTransport({
            service: 'Gmail',
            secure: true, // true for 465, false for other ports
            auth: {
              user: process.env.EMAIL_SENDER,
              pass: process.env.EMAIL_PASSWORD,
            },
          });

          let mailOptions = {
            to: userMail,
            from: `"TUB Internet Banking" <${process.env.EMAIL_SENDER}>`,
            subject: 'TUB Internet Banking | Confirm your transfer',
            text:
              'You are receiving this because you (or someone else) have requested the complete debt reminder for your account.\n\n' +
              'Please use the following OTP to complete the process:\n' +
              otp +
              '\n\n' +
              'If you did not request this, please ignore this email and your account will remain uncharged.\n',
          };
          transporter.sendMail(mailOptions, function (err) {
            console.log('ERR', err.message, process.env.EMAIL_SENDER);
          });

          console.log('gui mail reset done: ', userMail);
          // res.status(200).json({ message: 'An email has sent to your email' });
        },
      ],
      function (err, result) {
        if (err) throw err;
      },
    );

    // change pay status
    await DebtReminder.completeReminder(reminderId);
    res.status(200).end();
  },
};
