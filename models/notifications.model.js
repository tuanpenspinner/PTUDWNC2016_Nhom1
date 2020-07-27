const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notification = new Schema(
  {
    content: { type: String, required: true },
    time: { type: String, required: true },
    type: { type: String, required: true },
  },
  {
    _id: false,
  }
);
const notificationSchema = new Schema({
  accountNumber: { type: String, required: true },
  listNotifications: { type: [notification], required: true },
});

const Notification = mongoose.model(
  "Notification",
  notificationSchema,
  "notifications"
);

module.exports = {
  //tìm nhân viên theo email
  findByUsername: async (accountNumber) => {
    try {
      const ret = await Notification.findOne({ accountNumber: accountNumber });
      return ret;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  addNotification: async (accountNumber, content, time, type) => {
    try {
      var listNotification = await Notification.findOne({
        accountNumber: accountNumber,
      });
      if (listNotification === null) {
        var list = new Notification({ accountNumber, listNotifications: [] });

        await list.save();
        var listNo = await Notification.findOne({
          accountNumber: accountNumber,
        });
        listNo.listNotifications.push({
          content: content,
          time: time,
          type: type,
        });
        const ret = await listNo.save();
        return ret;
      } else {
        listNotification.listNotifications.push({
          content: content,
          time: time,
          type: type,
        });
        const ret = await listNotification.save();

        return ret;
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  },
};
