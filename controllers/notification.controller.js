const Notification = require("../models/notifications.model");

exports.getNotifications = async (req, res) => {
  try {
    const accountNumber = req.params.accountNumber;
    console.log(accountNumber);

    const ret = await Notification.findByUsername(accountNumber);

    if (ret) res.json({ status: true, notifications: ret.listNotifications });
    else
      return res.json({
        status: false,
      });
  } catch (e) {
    console.log("ERROR: " + e.message);

    return res.json({
      status: false,
    });
  }
};

exports.addNotification = async (req, res) => {
  try {
    const { username } = req.payload;
    const { content, time, type } = req.body;
    const ret = await Notification.addNotification(
      username,
      content,
      time,
      type
    );
    if (ret) res.json({ status: true, message: "Cập nhật thành công!" });
    else
      return res.json({
        status: false,
        message: "Cập nhật thất bại!",
      });
  } catch (e) {
    console.log("ERROR: " + e.message);

    return res.json({
      status: false,
      message: "Cập nhật thất bại!",
    });
  }
};
