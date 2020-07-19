const mongoose = require("mongoose");
const Customer = require("./customer.model");
const Schema = mongoose.Schema;
const typeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["internal", "transfer", "receive"],
    }, //internal: nội bộ, transfer: gửi tiền đến ngân hàng khác: receive: nhận tiền từ ngân hàng khác
    bankCode: { type: String, required: true }, //mã ngân hàng, nội bộ là mã ngân hàng của nhóm
  },
  {
    _id: false,
  }
);
const dealSchema = new Schema({
  receiverAccountNumber: { type: String, required: true }, //stk thanh toán của người nhận
  transfererAccountNumber: { type: String, required: true }, //stk thanh toán của người gửi
  time: {
    type: Date,
    default: null, //thời gian chuyển tiền
    required: true,
  },
  amount: { type: Number, required: true }, //số tiền gửi đi
  content: { type: String, trim: true }, //nội dung chuyển tiền
  isTransfered: { type: Boolean, default: false, required: true }, //check đã gửi
  payFeeBy: { type: String, required: true, enum: ["receiver", "transferer"] }, //hình thức trả phí (người gửi hoặc người nhận trả phí)
  type: { type: typeSchema, required: true }, //loại giao dịch
});

const Deal = mongoose.model("Deal", dealSchema, "deals");
module.exports = {
  addDeal: async (
    receiverAccountNumber,
    transfererAccountNumber,
    time,
    amount,
    content,
    isTransfered,
    payFeeBy,
    type
  ) => {
    try {
      const deal = await Deal.create({
        receiverAccountNumber,
        transfererAccountNumber,
        time,
        amount,
        content,
        isTransfered,
        payFeeBy,
        type,
      });

      return deal;
    } catch (e) {
      console.log("ERROR: " + e);

      throw e;
    }
  },
  updateDeal: async (id, time, isTransfered) => {
    try {
      const u = await Deal.findOneAndUpdate(
        { _id: id },
        { time: time },
        { isTransfered: isTransfered }
      );
      return u;
      // console.log('uupdate', u);
    } catch (err) {
      console.log("ERR", err.message);
    }
  },
  //lấy lịch sử chuyển tiền
  getHistoryTransfer: async (accountNumber) => {
    try {
      const resultHistoryTransfer = await Deal.find({
        transfererAccountNumber: accountNumber,
        isTransfered: true,
      });
      return resultHistoryTransfer;
      // console.log('uupdate', u);
    } catch (err) {
      console.log("ERR", err.message);
    }
  },
  //lấy lịch sử nhận tiền
  getHistoryReceive: async (accountNumber) => {
    try {
      const resultHistoryReceive = await Deal.find({
        receiverAccountNumber: accountNumber,
        isTransfered: true,
      });
      return resultHistoryReceive;
      // console.log('uupdate', u);
    } catch (err) {
      console.log("ERR", err.message);
    }
  },
};
